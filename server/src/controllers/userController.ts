import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { users } from "../models/schema.js";
import { eq } from "drizzle-orm";

// --- GET USER PROFILE ---
export const getUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      currency: users.currency,
      theme: users.theme
    }).from(users).where(eq(users.id, userId));

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

// --- UPDATE USER SETTINGS (Currency, Name, etc.) ---
export const updateUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { name, currency, theme } = req.body;

    const [updatedUser] = await db.update(users)
      .set({ 
        name, 
        currency, // Yahan currency update hogi
        theme,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        currency: users.currency,
        theme: users.theme
      });

    return res.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Error updating profile" });
  }
};