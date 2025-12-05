import express from "express";
import { createBudget, getBudgets } from "../controllers/budgetController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createBudget)
  .get(protect, getBudgets);

export default router;