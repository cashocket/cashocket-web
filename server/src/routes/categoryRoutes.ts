import express from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createCategory)
  .get(protect, getCategories);

// ID wale routes (Edit & Delete)
router.route("/:id")
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;