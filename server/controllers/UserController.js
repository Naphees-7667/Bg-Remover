import { Webhook } from "svix";
import userModel from "../models/userModel.js";

const clerkWebHooks = async (req, res) => {
  try {
    // Initialize webhook with the secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verify the incoming webhook request
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    // Log the incoming request body for structure verification
    console.log("Webhook body:", req.body);

    // Destructure data based on Clerk's expected format
    const [ data, type ] = req.body;

    // Switch based on the type of event received
    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          photo: data.image_url,
          firstName: data.first_name,
          lastName: data.last_name,
        };

        await userModel.create(userData);
        console.log("User Created Successfully:", userData);
        res
          .status(201)
          .json({ success: true, message: "User created successfully" });
        break;
      }

      case "user.updated": {
        const userData = {
            email: data.email_addresses[0].email_address,
            photo: data.image_url,
            firstName: data.first_name,
            lastName: data.last_name,
          };

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData, {
          new: true,
        });
        console.log("User Updated Successfully:", userData);
        res
          .status(200)
          .json({ success: true, message: "User updated successfully" });
        break;
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        console.log("User Deleted Successfully with Clerk ID:", data.id);
        res
          .status(200)
          .json({ success: true, message: "User deleted successfully" });
        break;
      }

      default: {
        console.log("Unhandled event type:", type);
        res
          .status(400)
          .json({ success: false, message: "Unhandled event type" });
        break;
      }
    }
  } catch (error) {
    console.error("Error handling webhook:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { clerkWebHooks };