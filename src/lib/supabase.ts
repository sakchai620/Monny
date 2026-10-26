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

// Database helper functions for Supabase tables
export async function syncSupabaseTransactions(userUid: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_uid', userUid)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error (table may need creation):', error.message);
      return null;
    }
    return data;
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
      user_uid: userUid,
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
      .eq('id', id)
      .eq('user_uid', userUid);

    if (error) {
      console.warn('Supabase delete warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to delete from Supabase:', err);
  }
}
