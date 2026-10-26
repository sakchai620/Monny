import {
  Transaction,
  MonthlyBudget,
  BudgetStatus,
  MonthlyFinancialSummary,
  AssetTradeTransaction,
  InvestmentTransaction,
  MajorExpenseTransaction,
  MajorExpenseCategory,
} from '../types/finance';

/**
 * คำนวณกำไร/ขาดทุนของรายการซื้อมา-ขายไป (เช่น รถยนต์)
 * กำไร/ขาดทุน = ราคาขาย - (ราคาซื้อ + ค่าบำรุงรักษา/แต่งเติม)
 */
export function calculateAssetProfitLoss(trade: AssetTradeTransaction): {
  cost: number;
  revenue: number;
  profitLoss: number;
  profitPercentage: number;
} {
  const cost = trade.buyPrice + (trade.maintenanceCost || 0);
  const revenue = trade.isSold && trade.sellPrice !== undefined ? trade.sellPrice : 0;
  const profitLoss = trade.isSold && trade.sellPrice !== undefined ? revenue - cost : 0;
  const profitPercentage = cost > 0 && trade.isSold ? (profitLoss / cost) * 100 : 0;

  return {
    cost,
    revenue,
    profitLoss,
    profitPercentage: Math.round(profitPercentage * 10) / 10,
  };
}

/**
 * คำนวณกำไร/ขาดทุนของรายการลงทุน (เช่น หุ้นไทย, หุ้นเทศ, กองทุน)
 * กำไร/ขาดทุน = (มูลค่าปัจจุบัน + เงินปันผล) - ต้นทุนเงินลงทุน
 */
export function calculateInvestmentProfitLoss(inv: InvestmentTransaction): {
  cost: number;
  currentValue: number;
  dividend: number;
  profitLoss: number;
  profitPercentage: number;
} {
  const cost = inv.investedAmount;
  const dividend = inv.dividendReceived || 0;
  const currentValue = inv.currentValuation;
  const profitLoss = currentValue + dividend - cost;
  const profitPercentage = cost > 0 ? (profitLoss / cost) * 100 : 0;

  return {
    cost,
    currentValue,
    dividend,
    profitLoss,
    profitPercentage: Math.round(profitPercentage * 10) / 10,
  };
}

/**
 * คำนวณสถานะงบประมาณ
 */
export function calculateBudgetStatus(
  spentAmount: number,
  budgetAmount: number,
  cautionPercent: number = 80
): BudgetStatus {
  const validBudget = Math.max(0, budgetAmount);
  const validSpent = Math.max(0, spentAmount);
  const remaining = Math.max(0, validBudget - validSpent);
  const overAmount = validSpent > validBudget ? validSpent - validBudget : 0;
  const percentUsed = validBudget > 0 ? (validSpent / validBudget) * 100 : 0;

  const isExceeded = validBudget > 0 && validSpent >= validBudget;
  const isCaution = validBudget > 0 && !isExceeded && percentUsed >= cautionPercent;

  return {
    budgetAmount: validBudget,
    spentAmount: validSpent,
    remainingAmount: remaining,
    percentUsed: Math.round(percentUsed * 10) / 10,
    isCaution,
    isExceeded,
    overAmount,
  };
}

/**
 * คำนวณสรุปทางการเงินประจำเดือน (เน้นค่าใช้จ่ายหลักประจำเดือน ไม่มียิบย่อยรายวัน)
 */
export function calculateMonthlySummary(
  transactions: Transaction[],
  monthKey: string,
  budget: MonthlyBudget
): MonthlyFinancialSummary {
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(monthKey));

  let totalMajorExpenses = 0;
  let paidExpenses = 0;
  let unpaidExpenses = 0;
  let totalIncome = 0;

  let assetTradesCount = 0;
  let totalAssetBuyCost = 0;
  let totalAssetSellRevenue = 0;
  let assetRealizedProfitLoss = 0;

  let investmentsCount = 0;
  let totalInvestedAmount = 0;
  let totalInvestmentValuation = 0;
  let investmentProfitLoss = 0;
  let investmentDividend = 0;

  for (const tx of monthTransactions) {
    if (tx.type === 'major_expense') {
      totalMajorExpenses += tx.amount;
      if (tx.isPaid) {
        paidExpenses += tx.amount;
      } else {
        unpaidExpenses += tx.amount;
      }
    } else if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'asset_trade') {
      assetTradesCount++;
      const metrics = calculateAssetProfitLoss(tx);
      totalAssetBuyCost += metrics.cost;
      if (tx.isSold) {
        totalAssetSellRevenue += metrics.revenue;
        assetRealizedProfitLoss += metrics.profitLoss;
      }
    } else if (tx.type === 'investment') {
      investmentsCount++;
      const metrics = calculateInvestmentProfitLoss(tx);
      totalInvestedAmount += metrics.cost;
      totalInvestmentValuation += metrics.currentValue;
      investmentProfitLoss += metrics.profitLoss;
      investmentDividend += metrics.dividend;
    }
  }

  const netCashFlow = totalIncome - totalMajorExpenses;
  // กำไร/ขาดทุนรวม = เงินเหลือเก็บสุทธิ + กำไรขายสินทรัพย์ + ผลตอบแทนพอร์ตหุ้น
  const overallProfitLoss = netCashFlow + assetRealizedProfitLoss + investmentProfitLoss;

  const budgetStatus = calculateBudgetStatus(
    totalMajorExpenses,
    budget.amount,
    budget.cautionPercent || 80
  );

  return {
    monthKey,
    totalMajorExpenses,
    paidExpenses,
    unpaidExpenses,
    totalIncome,
    netCashFlow,
    assetTradesCount,
    totalAssetBuyCost,
    totalAssetSellRevenue,
    assetRealizedProfitLoss,
    investmentsCount,
    totalInvestedAmount,
    totalInvestmentValuation,
    investmentProfitLoss,
    investmentDividend,
    overallProfitLoss,
    budgetStatus,
  };
}

/**
 * จัดกลุ่มค่าใช้จ่ายหลักประจำเดือนตามหมวดหมู่
 */
export function getMajorExpenseCategoryBreakdown(
  transactions: Transaction[],
  monthKey: string
): { category: MajorExpenseCategory; label: string; amount: number; percentage: number; color: string; paidAmount: number }[] {
  const expenseMap: Record<MajorExpenseCategory, { total: number; paid: number }> = {
    housing: { total: 0, paid: 0 },
    car_installment: { total: 0, paid: 0 },
    utilities: { total: 0, paid: 0 },
    insurance: { total: 0, paid: 0 },
    debt_loan: { total: 0, paid: 0 },
    education: { total: 0, paid: 0 },
    maintenance: { total: 0, paid: 0 },
    other_major: { total: 0, paid: 0 },
  };

  const labels: Record<MajorExpenseCategory, { label: string; color: string }> = {
    housing: { label: 'ผ่อนบ้าน / คอนโด / ค่าเช่า', color: '#6366f1' }, // Indigo
    car_installment: { label: 'ค่างวดผ่อนรถยนต์ / มอเตอร์ไซค์', color: '#0ea5e9' }, // Sky
    utilities: { label: 'บิลค่าน้ำ ค่าไฟ อินเทอร์เน็ต', color: '#f59e0b' }, // Amber
    insurance: { label: 'เบี้ยประกันชีวิต / ประกันรถ', color: '#10b981' }, // Emerald
    debt_loan: { label: 'สินเชื่อ / ชำระหนี้หลัก', color: '#ec4899' }, // Pink
    education: { label: 'ค่าเทอม / การศึกษา', color: '#8b5cf6' }, // Purple
    maintenance: { label: 'ค่าส่วนกลาง / บำรุงรักษา', color: '#14b8a6' }, // Teal
    other_major: { label: 'ค่าใช้จ่ายหลักอื่นๆ', color: '#64748b' }, // Slate
  };

  let grandTotal = 0;
  const monthTransactions = transactions.filter(
    (tx): tx is MajorExpenseTransaction => tx.type === 'major_expense' && tx.date.startsWith(monthKey)
  );

  for (const tx of monthTransactions) {
    expenseMap[tx.category].total += tx.amount;
    if (tx.isPaid) {
      expenseMap[tx.category].paid += tx.amount;
    }
    grandTotal += tx.amount;
  }

  const result = Object.entries(expenseMap)
    .filter(([_, data]) => data.total > 0)
    .map(([cat, data]) => {
      const category = cat as MajorExpenseCategory;
      const percentage = grandTotal > 0 ? (data.total / grandTotal) * 100 : 0;
      return {
        category,
        label: labels[category]?.label || category,
        amount: data.total,
        paidAmount: data.paid,
        percentage: Math.round(percentage * 10) / 10,
        color: labels[category]?.color || '#94a3b8',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return result;
}

/**
 * รูปแบบแสดงผลเงินบาท
 */
export function formatThaiCurrency(amount: number, withSign: boolean = false): string {
  const absAmount = Math.abs(amount).toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  if (withSign) {
    if (amount > 0) return `+฿${absAmount}`;
    if (amount < 0) return `-฿${absAmount}`;
    return `฿${absAmount}`;
  }

  return `฿${absAmount}`;
}

/**
 * แปลงเดือน YYYY-MM เป็นชื่อเดือนภาษาไทย เช่น "ตุลาคม 2569"
 */
export function formatThaiMonth(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  const thaiYear = year + 543;
  return `${thaiMonths[month] || monthStr} ${thaiYear}`;
}

/**
 * แปลงเดือน YYYY-MM เป็นชื่อเดือนสั้น เช่น "ต.ค. 69" สำหรับหน้าจอมือถือ
 */
export function formatThaiMonthShort(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  const shortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];

  const shortYear = ((year + 543) % 100).toString().padStart(2, '0');
  return `${shortMonths[month] || monthStr} ${shortYear}`;
}

/**
 * วันที่ภาษาไทยสั้น เช่น 24 ต.ค. 69
 */
export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[0], 10) + 543;
  const shortYear = (year % 100).toString().padStart(2, '0');

  const shortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];

  return `${day} ${shortMonths[month] || parts[1]} ${shortYear}`;
}
