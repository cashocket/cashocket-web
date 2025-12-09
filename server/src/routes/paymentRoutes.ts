import express from "express";
import { createSubscription, verifySubscription } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-subscription", protect, createSubscription);
router.post("/verify-subscription", protect, verifySubscription);

export default router;