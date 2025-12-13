import express from "express";
import { createCheckoutSession } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/payments/create-checkout-session
router.post("/create-checkout-session", protect, createCheckoutSession);

export default router;