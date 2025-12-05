import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { accounts, transactions } from "../models/schema.js";
import { eq, desc, and } from "drizzle-orm";

// --- CREATE ACCOUNT ---
export const createAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, type, balance, color, icon } = req.body; // 'icon' added
    // @ts-ignore
    const userId = req.user.id;

    const [newAccount] = await db.insert(accounts).values({
      name, type, balance, color, icon, userId
    }).returning();

    return res.status(201).json(newAccount);
  } catch (error) {
    console.error("Create Account Error:", error);
    return res.status(500).json({ message: "Error creating account" });
  }
};

// --- GET ACCOUNTS ---
export const getAccounts = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const allAccounts = await db.select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));

    return res.status(200).json(allAccounts);
  } catch (error) {
    console.error("Get Accounts Error:", error);
    return res.status(500).json({ message: "Error fetching accounts" });
  }
};

// --- GET DASHBOARD SUMMARY ---
export const getDashboardSummary = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // 1. Calculate Total Balance (Sum of all accounts)
    const accountsData = await db.select().from(accounts).where(eq(accounts.userId, userId));
    const totalBalance = accountsData.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

    // 2. Calculate Total Income & Expense (Last 30 days logic can be added later, currently total)
    const incomeData = await db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.type, 'income')));
    const expenseData = await db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.type, 'expense')));

    const totalIncome = incomeData.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = expenseData.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return res.status(200).json({
      totalBalance,
      totalIncome,
      totalExpense,
      accountsCount: accountsData.length
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    return res.status(500).json({ message: "Error fetching summary" });
  }
};

// --- UPDATE ACCOUNT ---
export const updateAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, type, color, balance, icon } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    const [updatedAccount] = await db.update(accounts)
      .set({ name, type, color, balance, icon, updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();

    if (!updatedAccount) return res.status(404).json({ message: "Account not found" });

    return res.json(updatedAccount);
  } catch (error) {
    return res.status(500).json({ message: "Error updating account" });
  }
};

// --- GET SINGLE ACCOUNT DETAILS ---
export const getAccountById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    const [account] = await db.select().from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    if (!account) return res.status(404).json({ message: "Account not found" });

    return res.json(account);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching account details" });
  }
};

// --- DELETE ACCOUNT (Already discussed, ensuring it's here) ---
export const deleteAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    // Transaction delete logic complex ho sakti hai (CASCADE), 
    // par abhi ke liye maan ke chalte hain DB handles cascading or we allow it.
    await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    return res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting account" });
  }
};