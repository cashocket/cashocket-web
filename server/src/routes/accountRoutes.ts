import express from "express";
import { createAccount, deleteAccount, getAccountById, getAccounts, getDashboardSummary, updateAccount } from "../controllers/accountController.js"; // Import updated
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// New Route for Summary (Order matters: isko dynamic routes se pehle rakhein)
router.get("/summary", protect, getDashboardSummary); // GET /api/accounts/summary

router.route("/:id")
  .get(protect, getAccountById)    // NEW: Get Single Account
  .put(protect, updateAccount)     // NEW: Edit Account
  .delete(protect, deleteAccount);

router.route("/")
  .post(protect, createAccount)
  .get(protect, getAccounts);

export default router;