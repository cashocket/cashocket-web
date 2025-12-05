import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { users } from "../models/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// --- SIGNUP LOGIC ---
export const signupUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default currency 'INR' schema mein already set hai
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning();

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      currency: newUser.currency, // New: Currency bhi return kar rahe hain
      token: generateToken(newUser.id),
      message: "Account created successfully!"
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Server Error during signup." });
  }
};

// --- LOGIN LOGIC ---
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (user && (await bcrypt.compare(password, user.password || ""))) {
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency, // New: Currency bhi return kar rahe hain
        token: generateToken(user.id),
        message: "Logged in successfully!"
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server Error during login." });
  }
};