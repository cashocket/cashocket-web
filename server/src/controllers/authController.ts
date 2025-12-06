import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { users } from "../models/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";

// Google Client Setup
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

// --- GOOGLE AUTH LOGIC (NEW) ---
export const googleAuth = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code } = req.body; // Frontend se 'code' aayega

    // 1. Code ko Tokens mein exchange karein
    const { tokens } = await client.getToken(code);
    
    // 2. ID Token verify karein
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Invalid Google Token" });

    const { email, name, sub: googleId, picture } = payload;

    // 3. Check karein user exist karta hai ya nahi
    const [existingUser] = await db.select().from(users).where(eq(users.email, email!));

    if (existingUser) {
      // User hai -> Login karo (Google ID update kar sakte hain agar pehle nahi tha)
      if (!existingUser.googleId) {
        await db.update(users).set({ googleId, avatar: existingUser.avatar || picture }).where(eq(users.id, existingUser.id));
      }

      return res.json({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        currency: existingUser.currency,
        avatar: existingUser.avatar,
        token: generateToken(existingUser.id),
        message: "Logged in with Google successfully!"
      });
    } else {
      // User nahi hai -> Naya Account banao (Signup)
      const [newUser] = await db.insert(users).values({
        name: name!,
        email: email!,
        password: null, // Google users ka password nahi hota
        googleId: googleId,
        avatar: picture,
      }).returning();

      return res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        currency: newUser.currency,
        avatar: newUser.avatar,
        token: generateToken(newUser.id),
        message: "Account created with Google!"
      });
    }

  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};

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