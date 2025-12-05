import express from "express";
import { createTransaction, getTransactions, deleteTransaction, updateTransaction } from "../controllers/transactionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createTransaction)
  .get(protect, getTransactions);

router.route("/:id")
  .delete(protect, deleteTransaction)
  .put(protect, updateTransaction);

export default router;