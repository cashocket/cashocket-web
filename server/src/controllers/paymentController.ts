import Razorpay from "razorpay";
import crypto from "crypto";
import { Request, Response } from "express";
import { db } from "../config/db.js";
import { subscriptions } from "../models/schema.js";

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// --- 1. CREATE SUBSCRIPTION ---
export const createSubscription = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // Billing 3 mahine baad start hogi (Trial Logic)
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 3);
    const startAt = Math.floor(trialEndDate.getTime() / 1000); // Unix Timestamp

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID!,
      customer_notify: 1,
      total_count: 120, // 10 years
      start_at: startAt, // Future start date
      addons: [],
      notes: { userId },
    });

    return res.status(200).json({
      id: subscription.id,
      key_id: process.env.RAZORPAY_KEY_ID, // Frontend ko chahiye
    });

  } catch (error) {
    console.error("Subscription Create Error:", error);
    return res.status(500).json({ message: "Failed to create subscription" });
  }
};

// --- 2. VERIFY PAYMENT ---
export const verifySubscription = async (req: Request, res: Response): Promise<any> => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    // --- FIX: Signature Verification Logic ---
    const body = razorpay_payment_id + "|" + razorpay_subscription_id;
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    // Debugging ke liye (Console mein dekhein kya match nahi ho raha)
    console.log("Expected:", expectedSignature);
    console.log("Received:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid Signature" });
    }

    // --- FIX: DB Transaction Check ---
    // Check agar subscription already exist karta hai toh crash na ho
    try {
      await db.insert(subscriptions).values({
        userId,
        razorpaySubscriptionId: razorpay_subscription_id,
        razorpayPlanId: process.env.RAZORPAY_PLAN_ID!,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 3)), 
      });
    } catch (dbError: any) {
      // Agar duplicate key error hai, toh ise success maano (User refresh kar raha hoga)
      if (dbError.code === '23505') {
         return res.json({ success: true, message: "Subscription already active!" });
      }
      throw dbError; // Koi aur error hai toh catch block mein bhejo
    }

    return res.json({ success: true, message: "Subscription verified!" });

  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ message: "Payment verification failed" });
  }
};