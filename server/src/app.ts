import express from "express";
import type { Application, Request, Response } from "express"; // Note: 'type' keyword add kiya hai
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
// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing (Frontend ko allow karne ke liye)
app.use(cors({
  origin: "http://localhost:3000", // Next.js client URL
  credentials: true,
}));

// Logger (Requests ko console mein dekhne ke liye)
app.use(morgan("dev"));

// Body parsers (JSON data padhne ke liye)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
// Health Check Route
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