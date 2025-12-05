import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { categories } from "../models/schema.js";
import { eq, and } from "drizzle-orm";

// --- CREATE CATEGORY ---
export const createCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, type, color, icon } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    const [newCategory] = await db.insert(categories).values({
      name,
      type, // 'income' or 'expense'
      color: color || "#3b82f6",
      icon: icon || "🏷️",
      userId
    }).returning();

    return res.status(201).json(newCategory);
  } catch (error) {
    console.error("Create Category Error:", error);
    return res.status(500).json({ message: "Error creating category" });
  }
};

// --- GET CATEGORIES ---
export const getCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { type } = req.query; // Filter by type (income/expense) if needed

    let query = db.select().from(categories).where(eq(categories.userId, userId));

    if (type) {
        // @ts-ignore
        query = db.select().from(categories).where(and(eq(categories.userId, userId), eq(categories.type, type)));
    }

    const allCategories = await query;
    return res.status(200).json(allCategories);
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ message: "Error fetching categories" });
  }
};

// --- UPDATE CATEGORY ---
export const updateCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, type, color, icon } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    const [updatedCategory] = await db.update(categories)
      .set({ name, type, color, icon }) // Icon/Emoji update
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(updatedCategory);
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({ message: "Error updating category" });
  }
};

// --- DELETE CATEGORY ---
export const deleteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    // Note: Agar category delete hogi toh uske transactions ka kya hoga?
    // Behtar ye hai ki DB level par 'SET NULL' ho, par abhi ke liye hum direct delete karte hain.
    // Agar foreign key constraint error aaye toh hum transactions ko handle kar sakte hain.
    
    // 1. Delete
    const result = await db.delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    // Agar category use ho rahi hai to error aa sakta hai
    return res.status(500).json({ message: "Cannot delete category (It might be in use)" });
  }
};