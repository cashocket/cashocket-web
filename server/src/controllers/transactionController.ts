import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { transactions, accounts, categories } from "../models/schema.js";
import { eq, desc, sql, and } from "drizzle-orm";

// Helper: Check if date is in future
const isFutureDate = (dateString: string | Date) => {
  const inputDate = new Date(dateString);
  const now = new Date();
  return inputDate.getTime() > now.getTime();
};

// --- CREATE TRANSACTION / TRANSFER ---
export const createTransaction = async (req: Request, res: Response): Promise<any> => {
  try {
    const { accountId, toAccountId, categoryId, amount, type, date, description } = req.body;
    // @ts-ignore
    const userId = req.user.id;
    const numAmount = parseFloat(amount);

    // --- NEW VALIDATION: Check for Future Date/Time ---
    if (isFutureDate(date)) {
      return res.status(400).json({ 
        message: "You cannot add transactions for a future date or time." 
      });
    }

    // 1. TRANSFER LOGIC
    if (type === "transfer") {
      if (!toAccountId || accountId === toAccountId) {
        return res.status(400).json({ message: "Invalid transfer accounts" });
      }

      // Deduct from Source
      await db.update(accounts)
        .set({ balance: sql`${accounts.balance} - ${numAmount}` })
        .where(eq(accounts.id, accountId));

      // Add to Destination
      await db.update(accounts)
        .set({ balance: sql`${accounts.balance} + ${numAmount}` })
        .where(eq(accounts.id, toAccountId));
      
      // Record Transaction
      const [newTxn] = await db.insert(transactions).values({
        userId, accountId, toAccountId, amount: numAmount.toString(), type, date: new Date(date), description
      }).returning();
      
      return res.status(201).json(newTxn);
    }

    // 2. INCOME/EXPENSE LOGIC
    const [newTransaction] = await db.insert(transactions).values({
      userId, accountId, categoryId, amount: numAmount.toString(), type, date: new Date(date), description,
    }).returning();

    // Update Balance
    if (type === "income") {
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${numAmount}` }).where(eq(accounts.id, accountId));
    } else {
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${numAmount}` }).where(eq(accounts.id, accountId));
    }

    return res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Create Transaction Error:", error);
    return res.status(500).json({ message: "Error adding transaction" });
  }
};

// --- UPDATE (EDIT) TRANSACTION ---
export const updateTransaction = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { amount, description, date, categoryId, accountId, toAccountId } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    // --- NEW VALIDATION: Check for Future Date/Time ---
    if (isFutureDate(date)) {
      return res.status(400).json({ 
        message: "You cannot set a future date or time." 
      });
    }

    // 1. Fetch Old Transaction
    const [oldTxn] = await db.select().from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    
    if (!oldTxn) return res.status(404).json({ message: "Transaction not found" });

    const oldAmount = parseFloat(oldTxn.amount);
    const newAmount = parseFloat(amount);

    // 2. REVERSE OLD EFFECT
    if (oldTxn.type === "expense") {
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${oldAmount}` }).where(eq(accounts.id, oldTxn.accountId));
    } 
    else if (oldTxn.type === "income") {
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${oldAmount}` }).where(eq(accounts.id, oldTxn.accountId));
    } 
    else if (oldTxn.type === "transfer" && oldTxn.toAccountId) {
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${oldAmount}` }).where(eq(accounts.id, oldTxn.accountId));
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${oldAmount}` }).where(eq(accounts.id, oldTxn.toAccountId));
    }

    // 3. APPLY NEW EFFECT
    if (oldTxn.type === "expense") {
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${newAmount}` }).where(eq(accounts.id, accountId));
    } 
    else if (oldTxn.type === "income") {
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${newAmount}` }).where(eq(accounts.id, accountId));
    } 
    else if (oldTxn.type === "transfer") {
       if (!toAccountId || accountId === toAccountId) {
          return res.status(400).json({ message: "Invalid transfer accounts" });
       }
       await db.update(accounts).set({ balance: sql`${accounts.balance} - ${newAmount}` }).where(eq(accounts.id, accountId));
       await db.update(accounts).set({ balance: sql`${accounts.balance} + ${newAmount}` }).where(eq(accounts.id, toAccountId));
    }

    // 4. UPDATE RECORD
    const [updatedTxn] = await db.update(transactions)
      .set({ 
        amount: newAmount.toString(),
        description, 
        date: new Date(date), 
        categoryId: oldTxn.type === 'transfer' ? null : categoryId,
        accountId,
        toAccountId: oldTxn.type === 'transfer' ? toAccountId : null,
        updatedAt: new Date() 
      })
      .where(eq(transactions.id, id))
      .returning();

    return res.json(updatedTxn);
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ message: "Error updating transaction" });
  }
};

// Delete Transaction aur Get Transaction same rahenge jaise pehle thay...
export const deleteTransaction = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    const [transaction] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    if (!transaction) return res.status(404).json({ message: "Not found" });

    const amount = parseFloat(transaction.amount);

    if (transaction.type === "income") {
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, transaction.accountId));
    } else if (transaction.type === "expense") {
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, transaction.accountId));
    } else if (transaction.type === "transfer" && transaction.toAccountId) {
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, transaction.accountId));
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, transaction.toAccountId));
    }

    await db.delete(transactions).where(eq(transactions.id, id));
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting" });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { type, accountId } = req.query;

    let filters = eq(transactions.userId, userId);
    if (type) { 
        // @ts-ignore
        filters = and(filters, eq(transactions.type, type)); 
    }
    if (accountId) {
        // @ts-ignore
        filters = and(filters, sql`(${transactions.accountId} = ${accountId} OR ${transactions.toAccountId} = ${accountId})`);
    }

    const data = await db.select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      description: transactions.description,
      accountId: transactions.accountId,
      categoryId: transactions.categoryId,
      toAccountId: transactions.toAccountId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      accountName: accounts.name,
      accountIcon: accounts.icon,
      toAccountName: sql<string>`(SELECT name FROM accounts WHERE id = ${transactions.toAccountId})`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(filters)
    .orderBy(desc(transactions.date));

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching" });
  }
};