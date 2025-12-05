import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): any => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // IMPORTANT: Wahi same logic jo generateToken.ts mein tha
      const secret = process.env.JWT_SECRET || "default_secret_key_fallback_123";

      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error("Token Verification Failed:", error); // Server terminal mein error dikhega
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};