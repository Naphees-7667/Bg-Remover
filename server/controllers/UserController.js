import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";
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

//API controller function to get user available  credits data

const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.body;
    const userData = await userModel.findOne({ clerkId });
    res.json({ success: true, credits: userData.creditBalance });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//gateway initialize

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//API to make payment for credits

const paymentRazorpay = async (req, res) => {
  try {
    const { clerkId, planId } = req.body;
    const userData = await userModel.findOne({ clerkId });
    if (!userData || !planId) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    let credits, plan, amount, date;

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10;
        break;

      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50;
        break;

      case "Business":
        plan = "Business";
        credits = 5000;
        amount = 250;
        break;

      default:
        break;
    }

    date = Date.now();

    const transactionData = {
      clerkId,
      plan,
      amount,
      credits,
      date
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount : amount*100,
      currency: process.env.CURRENCY,
      receipt: newTransaction._id
    }

    await razorpayInstance.orders.create(options, (err, order) => {
      if (err) {
        console.log(err);
        return res.json({success:false,message:error.message})
      } else {
        res.json({ success: true, order });
      }
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API Controller function to verify razorpay payment

const verifyRazorpay = async (req, res) => {
  try{
    const { razorpay_order_id} = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if(orderInfo.status === 'paid'){
      const transactionData = await transactionModel.findById(orderInfo.receipt);
      if(transactionData.payment){
        return res.json({success:false,message:"Payment Failed"})
      }

      //adding credits in user data 
      const userData = await userModel.findOne({clerkId:transactionData.clerkId});
      userData.creditBalance += transactionData.credits;
      await userData.save();
      //marking the payment true
      transactionData.payment = true;
      await transactionData.save();
      res.json({success:true,message:"Payment Successful"})
    }
  }
  catch(error){
    console.log(error.message); 
    res.json({success:false,message:error.message})
  }
}

export { clerkWebHooks, userCredits ,paymentRazorpay,verifyRazorpay};