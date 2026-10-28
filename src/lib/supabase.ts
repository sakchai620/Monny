import { createClient } from '@supabase/supabase-js';
import { Transaction, MonthlyBudget } from '../types/finance';

export const SUPABASE_URL = 'https://azmbasuciqfgxajalhxn.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bWJhc3VjaXFmZ3hhamFsaHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5OTM5NzUsImV4cCI6MjEwODU2OTk3NX0.jPRTjfU1LscTq6gb5DMTeaEnbtS39nAzAdVuKqYwJIY';

export const getSupabaseAnonKey = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('supabase_anon_key');
    if (stored) return stored;
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
};

export const createSupabaseClient = (anonKey?: string) => {
  const key = anonKey || getSupabaseAnonKey();
  return createClient(SUPABASE_URL, key);
};

export const supabase = createSupabaseClient();

export function mapSupabaseToTransaction(row: any): Transaction {
  const amount = Number(row.amount) || 0;
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now();

  if (row.type === 'income') {
    return {
      id: row.id,
      type: 'income',
      title: row.title || 'รายรับ',
      amount: amount,
      category: row.category || 'other',
      date: row.date || new Date().toISOString().slice(0, 10),
      note: row.note || '',
      createdAt,
    };
  } else if (row.type === 'major_expense') {
    return {
      id: row.id,
      type: 'major_expense',
      title: row.title || 'ค่าใช้จ่าย',
      amount: amount,
      category: row.category || 'other_major',
      date: row.date || new Date().toISOString().slice(0, 10),
      isPaid: row.is_paid ?? true,
      dueDate: row.due_date || undefined,
      note: row.note || '',
      createdAt,
    };
  } else if (row.type === 'asset_trade') {
    return {
      id: row.id,
      type: 'asset_trade',
      title: row.title || 'สินทรัพย์',
      assetCategory: row.category || 'other',
      buyPrice: amount,
      sellPrice: amount,
      buyDate: row.date || new Date().toISOString().slice(0, 10),
      isSold: true,
      date: row.date || new Date().toISOString().slice(0, 10),
      note: row.note || '',
      createdAt,
    };
  } else if (row.type === 'investment') {
    return {
      id: row.id,
      type: 'investment',
      title: row.title || 'การลงทุน',
      investmentCategory: row.category || 'other',
      investedAmount: amount,
      currentValuation: amount,
      status: 'holding',
      date: row.date || new Date().toISOString().slice(0, 10),
      note: row.note || '',
      createdAt,
    };
  }
  return {
    id: row.id,
    type: 'major_expense',
    title: row.title || 'รายการทั่วไป',
    amount: amount,
    category: row.category || 'other_major',
    date: row.date || new Date().toISOString().slice(0, 10),
    isPaid: row.is_paid ?? true,
    note: row.note || '',
    createdAt,
  };
}

// Database helper functions for Supabase tables
export async function syncSupabaseTransactions(userUid: string = 'guest'): Promise<Transaction[] | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error (table may need creation):', error.message);
      return null;
    }
    if (data && Array.isArray(data)) {
      return data.map(mapSupabaseToTransaction);
    }
    return [];
  } catch (err) {
    console.error('Supabase sync error:', err);
    return null;
  }
}

export async function saveSupabaseTransaction(userUid: string, tx: Transaction) {
  try {
    let amount = 0;
    let category = 'other';
    let isPaid = true;
    let dueDate: string | null = null;

    if (tx.type === 'major_expense') {
      amount = tx.amount;
      category = tx.category;
      isPaid = tx.isPaid;
      dueDate = tx.dueDate || null;
    } else if (tx.type === 'income') {
      amount = tx.amount;
      category = tx.category;
    } else if (tx.type === 'asset_trade') {
      amount = tx.sellPrice ? tx.sellPrice - tx.buyPrice : tx.buyPrice;
      category = tx.assetCategory;
    } else if (tx.type === 'investment') {
      amount = tx.investedAmount;
      category = tx.investmentCategory;
    }

    const payload = {
      id: tx.id,
      user_uid: userUid || 'guest',
      type: tx.type,
      title: tx.title,
      amount,
      category,
      date: tx.date,
      is_paid: isPaid,
      due_date: dueDate,
      note: tx.note || null,
    };

    const { error } = await supabase.from('transactions').upsert(payload);
    if (error) {
      console.warn('Supabase upsert warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to save to Supabase:', err);
  }
}

export async function deleteSupabaseTransaction(userUid: string, id: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase delete warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to delete from Supabase:', err);
  }
}

