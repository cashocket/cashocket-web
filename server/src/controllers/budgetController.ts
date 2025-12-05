import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { budgets, categories, transactions } from "../models/schema.js";
import { eq, and, gte, lte, sql } from "drizzle-orm";

// --- CREATE BUDGET ---
export const createBudget = async (req: Request, res: Response): Promise<any> => {
  try {
    const { categoryId, amount } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    // Check if budget already exists for this category
    const existingBudget = await db.select().from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.categoryId, categoryId)));

    if (existingBudget.length > 0) {
      return res.status(400).json({ message: "Budget for this category already exists" });
    }

    const [newBudget] = await db.insert(budgets).values({
      userId,
      categoryId,
      amount: amount.toString(),
      period: "monthly",
      startDate: new Date(), // Start of current month logic can be added later
    }).returning();

    return res.status(201).json(newBudget);
  } catch (error) {
    console.error("Create Budget Error:", error);
    return res.status(500).json({ message: "Error creating budget" });
  }
};

// --- GET BUDGETS WITH PROGRESS ---
export const getBudgets = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // 1. Get all budgets with category details
    const userBudgets = await db.select({
      id: budgets.id,
      amount: budgets.amount,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.userId, userId));

    // 2. Calculate spent amount for each budget (Current Month Logic)
    const budgetsWithProgress = await Promise.all(userBudgets.map(async (budget) => {
      // Get start and end of current month
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Sum transactions for this category in current month
      const result = await db.select({
        spent: sql<number>`sum(${transactions.amount})`
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.categoryId, budget.categoryId!),
        eq(transactions.type, 'expense'),
        gte(transactions.date, firstDay),
        lte(transactions.date, lastDay)
      ));

      const spent = result[0].spent || 0;
      const total = parseFloat(budget.amount);
      const percentage = Math.min((spent / total) * 100, 100);

      return {
        ...budget,
        spent,
        percentage
      };
    }));

    return res.status(200).json(budgetsWithProgress);
  } catch (error) {
    console.error("Get Budgets Error:", error);
    return res.status(500).json({ message: "Error fetching budgets" });
  }
};