import express from "express";
import { createCheckoutSession, createCustomerPortal } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/create-portal-session", protect, createCustomerPortal); // NEW Route

export default router;