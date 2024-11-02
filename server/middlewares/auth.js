import jwt from "jsonwebtoken";

// Middleware to decode JWT token and get clerk ID
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Verify and decode the token
        const token_decoded = jwt.decode(token);
        if (!token_decoded || !token_decoded.clerkId) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        req.body.clerkId = token_decoded.clerkId;
        next();
    } catch (err) {
        console.log(err.message);
        res.status(401).json({ success: false, message: err.message });
    }
};

export default authUser;
