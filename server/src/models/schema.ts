import { pgTable, uuid, text, timestamp, boolean, decimal, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums (Fixed values)
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense", "transfer"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "inactive", "past_due", "canceled"]);

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // Google auth walo ka null ho sakta hai
  avatar: text("avatar"),
  googleId: text("google_id"),
  currency: text("currency").default("INR"),
  theme: text("theme").default("system"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Subscriptions Table (SaaS Logic)
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Razorpay Specific Fields
  razorpaySubscriptionId: text("razorpay_subscription_id").unique(),
  razorpayPlanId: text("razorpay_plan_id"),
  
  status: subscriptionStatusEnum("status").default("inactive"), // active, authenticated, etc.
  
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. Accounts Table (e.g., Bank, Wallet, Cash)
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  isDefault: boolean("is_default").default(false),
  color: text("color").default("#000000"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 4. Categories Table
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(), // e.g., "Food", "Salary"
  type: transactionTypeEnum("type").notNull(), // income or expense
  icon: text("icon"), // Icon ka naam ya URL store karenge
  color: text("color"), // Hex code for UI
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Transactions Table (Income, Expense, Transfer)
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id), // Transfer ke liye null ho sakta hai
  toAccountId: uuid("to_account_id"), // Sirf transfer ke liye use hoga
  
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 6. Budgets Table
export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id), // Specific category ka budget
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  period: text("period").default("monthly"), // "weekly", "monthly", "custom"
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations define kar rahe hain (Drizzle ko queries mein join karne ke liye chahiye)
export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  accounts: many(accounts),
  transactions: many(transactions),
  categories: many(categories),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));