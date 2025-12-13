import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../config/db.js";
import { users, subscriptions } from "../models/schema.js";
import { eq } from "drizzle-orm";

dotenv.config();

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "default_secret_key_fallback_123";
      
      const decoded: any = jwt.verify(token, secret);

      // 1. Fetch User & Subscription Status from DB
      // Left Join karke subscription status bhi nikalo
      const [userData] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        subStatus: subscriptions.status
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(eq(users.id, decoded.id));

      if (!userData) {
        return res.status(401).json({ message: "User not found" });
      }

      // 2. Attach User to Request
      req.user = userData;

      // 3. OPTIONAL: Agar API level par hi block karna hai (Strict Mode)
      // Note: Isse /users/profile aur /create-checkout-session ko exclude karna padega
      // Filhal hum frontend par bharosa kar rahe hain redirect ke liye, 
      // par ye data `req.user` mein available hone se hum specific routes protect kar sakte hain.

      next();
    } catch (error) {
      console.error("Auth Failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};