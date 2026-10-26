import { db } from './index.ts';
import { users, transactions, budgets } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Database operation failed when registering user', { cause: error });
  }
}

export async function getUserTransactions(userUid: string) {
  try {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userUid, userUid));
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw new Error('Failed to fetch user transactions from database', { cause: error });
  }
}

export async function addTransaction(data: {
  id: string;
  userUid: string;
  type: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  isPaid?: boolean;
  dueDate?: string;
  note?: string;
}) {
  try {
    const result = await db
      .insert(transactions)
      .values({
        id: data.id,
        userUid: data.userUid,
        type: data.type,
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date,
        isPaid: data.isPaid ?? true,
        dueDate: data.dueDate,
        note: data.note,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to add transaction:', error);
    throw new Error('Failed to add transaction to database', { cause: error });
  }
}

export async function deleteTransaction(userUid: string, id: string) {
  try {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userUid, userUid)));
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    throw new Error('Failed to delete transaction from database', { cause: error });
  }
}

export async function toggleTransactionPaid(userUid: string, id: string) {
  try {
    const current = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userUid, userUid)));

    if (current.length === 0) return null;

    const newIsPaid = !current[0].isPaid;

    const result = await db
      .update(transactions)
      .set({ isPaid: newIsPaid })
      .where(and(eq(transactions.id, id), eq(transactions.userUid, userUid)))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to toggle transaction paid status:', error);
    throw new Error('Failed to update transaction status in database', { cause: error });
  }
}

export async function getUserBudget(userUid: string, monthKey: string) {
  try {
    const result = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userUid, userUid), eq(budgets.monthKey, monthKey)));

    if (result.length === 0) {
      return {
        monthKey,
        amount: 0,
        cautionPercent: 80,
        alertEnabled: true,
      };
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get user budget:', error);
    throw new Error('Failed to fetch user budget from database', { cause: error });
  }
}

export async function saveUserBudget(data: {
  userUid: string;
  monthKey: string;
  amount: number;
  cautionPercent?: number;
  alertEnabled?: boolean;
}) {
  try {
    const existing = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userUid, data.userUid), eq(budgets.monthKey, data.monthKey)));

    if (existing.length > 0) {
      const result = await db
        .update(budgets)
        .set({
          amount: data.amount,
          cautionPercent: data.cautionPercent ?? 80,
          alertEnabled: data.alertEnabled ?? true,
        })
        .where(and(eq(budgets.userUid, data.userUid), eq(budgets.monthKey, data.monthKey)))
        .returning();

      return result[0];
    } else {
      const result = await db
        .insert(budgets)
        .values({
          userUid: data.userUid,
          monthKey: data.monthKey,
          amount: data.amount,
          cautionPercent: data.cautionPercent ?? 80,
          alertEnabled: data.alertEnabled ?? true,
        })
        .returning();

      return result[0];
    }
  } catch (error) {
    console.error('Failed to save user budget:', error);
    throw new Error('Failed to save budget in database', { cause: error });
  }
}
