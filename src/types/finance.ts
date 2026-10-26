export type TransactionType = 'major_expense' | 'income' | 'asset_trade' | 'investment';

// หมวดหมู่ค่าใช้จ่ายหลักประจำเดือน (ตัดรายจ่ายยิบย่อยรายวันออก)
export type MajorExpenseCategory =
  | 'housing' // ผ่อนบ้าน / คอนโด / ค่าเช่า
  | 'car_installment' // ผ่อนงวดรถยนต์ / มอเตอร์ไซค์
  | 'utilities' // บิลค่าน้ำ ค่าไฟ อินเทอร์เน็ต
  | 'insurance' // เบี้ยประกันชีวิต / สุขภาพ / ประกันภัยรถ
  | 'debt_loan' // สินเชื่อ / ชำระหนี้หลัก
  | 'education' // ค่าเทอม / การศึกษา
  | 'maintenance' // ค่าส่วนกลาง / บำรุงรักษาทรัพย์สิน
  | 'other_major'; // ค่าใช้จ่ายหลักอื่นๆ

export type IncomeCategory =
  | 'salary' // เงินเดือนประจำ
  | 'business' // รายได้ธุรกิจ / ค้าขาย
  | 'freelance' // งานสัญญา / โปรเจกต์
  | 'bonus' // โบนัส
  | 'dividend' // ปันผลหุ้น/สินทรัพย์
  | 'other';

export type AssetCategory =
  | 'car' // รถยนต์ / มอเตอร์ไซค์
  | 'gadget' // อุปกรณ์ไอที / กล้อง
  | 'luxury' // นาฬิกา / แบรนด์เนม
  | 'property' // อสังหาฯ / ที่ดิน
  | 'other';

export type InvestmentCategory =
  | 'stock_thai' // หุ้นไทย (SET)
  | 'stock_foreign' // หุ้นต่างประเทศ (US/Global Tech)
  | 'mutual_fund' // กองทุนรวม (DCA)
  | 'crypto' // คริปโตเคอร์เรนซี
  | 'gold' // ทองคำแท่ง
  | 'other';

export interface BaseTransaction {
  id: string;
  type: TransactionType;
  title: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
}

// ค่าใช้จ่ายหลักประจำเดือน (มีสถานะจ่ายแล้ว/ยังไม่จ่าย)
export interface MajorExpenseTransaction extends BaseTransaction {
  type: 'major_expense';
  amount: number;
  category: MajorExpenseCategory;
  isPaid: boolean; // จ่ายแล้ว หรือ รอดำเนินการ
  dueDate?: string; // วันครบกำหนดชำระในแต่ละเดือน
}

export interface StandardIncomeTransaction extends BaseTransaction {
  type: 'income';
  amount: number;
  category: IncomeCategory;
}

export interface AssetTradeTransaction extends BaseTransaction {
  type: 'asset_trade';
  assetCategory: AssetCategory;
  buyPrice: number; // ซื้อมากี่บาท
  sellPrice?: number; // ขายไปกี่บาท (ถ้าขายแล้ว)
  buyDate: string;
  sellDate?: string;
  isSold: boolean; // ขายแล้วหรือยัง
  maintenanceCost?: number; // ค่าซ่อม/แต่งเติม (ถ้ามี)
}

export interface InvestmentTransaction extends BaseTransaction {
  type: 'investment';
  investmentCategory: InvestmentCategory;
  investedAmount: number; // เดือนนี้ลงทุนไปกี่บาท
  currentValuation: number; // มูลค่าปัจจุบัน
  dividendReceived?: number; // เงินปันผลที่ได้รับ (ถ้ามี)
  status: 'holding' | 'realized';
}

export type Transaction =
  | MajorExpenseTransaction
  | StandardIncomeTransaction
  | AssetTradeTransaction
  | InvestmentTransaction;

export interface MonthlyBudget {
  monthKey: string; // YYYY-MM
  amount: number; // งบประมาณค่าใช้จ่ายหลักประจำเดือน
  cautionPercent: number; // แจ้งเตือนเมื่อถึง % เช่น 80%
  alertEnabled: boolean;
}

export interface NotificationLog {
  id: string;
  timestamp: number;
  type: 'budget_caution' | 'budget_exceeded' | 'trade_profit' | 'investment_milestone' | 'test';
  title: string;
  message: string;
  read: boolean;
}

export interface BudgetStatus {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  isCaution: boolean;
  isExceeded: boolean;
  overAmount: number;
}

export interface MonthlyFinancialSummary {
  monthKey: string;
  // ค่าใช้จ่ายหลักประจำเดือน
  totalMajorExpenses: number;
  paidExpenses: number;
  unpaidExpenses: number;
  totalIncome: number;
  netCashFlow: number;

  // ซื้อมา-ขายไป (รถยนต์)
  assetTradesCount: number;
  totalAssetBuyCost: number;
  totalAssetSellRevenue: number;
  assetRealizedProfitLoss: number;

  // การลงทุน (หุ้น)
  investmentsCount: number;
  totalInvestedAmount: number;
  totalInvestmentValuation: number;
  investmentProfitLoss: number;
  investmentDividend: number;

  // ผลกำไร/ขาดทุนสุทธิรวม
  overallProfitLoss: number;

  // สถานะงบ
  budgetStatus: BudgetStatus;
}
