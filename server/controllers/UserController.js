import { Webhook } from "svix";
import userModel from "../models/userModel.js";

const clerkWebHooks = async (req, res) => {
  console.log("Webhook endpoint hit");

  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    if (req.headers && req.body) {
      console.log("Incoming headers:", req.headers);
      console.log("Incoming body before verification:", req.body);
    }

    // Verify the webhook signature
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;
    console.log("Parsed webhook data:", data);
    console.log("Webhook event type:", type);

    switch (type) {
      case "user.created":
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
      case "user.updated":
        const updatedData = {
          email: data.email_addresses[0].email_address,
          photo: data.image_url,
          firstName: data.first_name,
          lastName: data.last_name,
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, updatedData, {
          new: true,
        });
        console.log("User Updated Successfully:", updatedData);
        res
          .status(200)
          .json({ success: true, message: "User updated successfully" });
        break;
      case "user.deleted":
        await userModel.findOneAndDelete({ clerkId: data.id });
        console.log("User Deleted Successfully with Clerk ID:", data.id);
        res
          .status(200)
          .json({ success: true, message: "User deleted successfully" });
        break;
      default:
        console.log(`Unhandled webhook event type: ${type}`);
        res
          .status(400)
          .json({ success: false, message: "Unhandled webhook event type" });
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { clerkWebHooks };