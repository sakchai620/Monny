import { Transaction, MonthlyBudget } from '../types/finance';

export const CURRENT_MONTH_KEY = '2026-10';

export const DEFAULT_BUDGET: MonthlyBudget = {
  monthKey: CURRENT_MONTH_KEY,
  amount: 0, // เริ่มต้นที่ 0 บาท ให้ผู้ใช้กำหนดเองจริง
  cautionPercent: 80,
  alertEnabled: true,
};

// ข้อมูลเริ่มต้นว่างเปล่า ทั้งหมดเป็น 0 ให้ผู้ใช้เพิ่มข้อมูลจริงด้วยตนเอง
export const INITIAL_TRANSACTIONS: Transaction[] = [];
