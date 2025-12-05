import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Ensure .env is loaded
dotenv.config();

const generateToken = (userId: string) => {
  // Agar env variable nahi mila toh ek default fallback use karega (Development ke liye)
  const secret = process.env.JWT_SECRET || "default_secret_key_fallback_123";

  if (!process.env.JWT_SECRET) {
    console.warn("⚠️ WARNING: JWT_SECRET .env mein nahi mila, fallback key use ho rahi hai.");
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: "30d",
  });
};

export default generateToken;