import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  real,
  boolean,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

// Define 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'transactions' table
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userUid: text('user_uid')
    .notNull()
    .references(() => users.uid, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'income' | 'major_expense'
  title: text('title').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  isPaid: boolean('is_paid').default(true),
  dueDate: text('due_date'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'budgets' table
export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .notNull()
    .references(() => users.uid, { onDelete: 'cascade' }),
  monthKey: text('month_key').notNull(), // YYYY-MM
  amount: real('amount').notNull(),
  cautionPercent: integer('caution_percent').default(80),
  alertEnabled: boolean('alert_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userUid],
    references: [users.uid],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userUid],
    references: [users.uid],
  }),
}));
