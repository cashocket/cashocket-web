import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";

const app: Application = express();

// --- Middlewares ---
app.use(helmet());

// --- FIX: CORS Configuration for Production & Localhost ---
// Future Proofing: Allowed origins ki list banayi hai.
const allowedOrigins = [
  "http://localhost:3000",                  // Local Development
  "https://cashocket-web.onrender.com"      // Production Frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Agar request bina origin ke hai (e.g. Postman/Mobile App) ya allowed list mein hai
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Cookies/Headers allow karne ke liye zaroori hai
}));

app.use(morgan("dev"));

// --- Body Parsers (10MB limit for Images) ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- Routes ---
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Cashocket Server is Running! 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);

export default app;