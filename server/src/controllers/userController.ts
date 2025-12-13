// server/src/controllers/userController.ts

import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { users, subscriptions } from "../models/schema.js"; // subscriptions add kiya
import { eq } from "drizzle-orm";

// --- GET USER PROFILE (Updated with Subscription) ---
export const getUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // Join Users with Subscriptions table
    const [data] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      currency: users.currency,
      theme: users.theme,
      avatar: users.avatar,
      stripeCustomerId: users.stripeCustomerId,
      // Nested Subscription Object
      subscription: {
        status: subscriptions.status,
        trialEnd: subscriptions.trialEnd,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      }
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(eq(users.id, userId));

    if (!data) return res.status(404).json({ message: "User not found" });

    return res.json(data);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

// --- UPDATE USER SETTINGS (No Changes Here) ---
export const updateUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { name, currency, theme, avatar } = req.body;

    const [updatedUser] = await db.update(users)
      .set({ 
        name, 
        currency,
        theme,
        avatar,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        currency: users.currency,
        theme: users.theme,
        avatar: users.avatar
      });

    return res.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Error updating profile" });
  }
};