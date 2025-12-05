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

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(morgan("dev"));

// --- FIX: Increased Body Limit to 10MB ---
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