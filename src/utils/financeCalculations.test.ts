import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAssetProfitLoss,
  calculateInvestmentProfitLoss,
  calculateBudgetStatus,
  calculateMonthlySummary,
  formatThaiCurrency,
  getMajorExpenseCategoryBreakdown,
} from './financeCalculations';
import {
  AssetTradeTransaction,
  InvestmentTransaction,
  MajorExpenseTransaction,
  StandardIncomeTransaction,
  MonthlyBudget,
} from '../types/finance';

test('calculateAssetProfitLoss calculates profit accurately for car purchase and sale', () => {
  const carTrade: AssetTradeTransaction = {
    id: 'tx-car-1',
    type: 'asset_trade',
    title: 'ซื้อขายรถยนต์มือสอง Honda Civic',
    assetCategory: 'car',
    buyPrice: 350000,
    sellPrice: 410000,
    maintenanceCost: 10000,
    buyDate: '2026-10-02',
    sellDate: '2026-10-20',
    date: '2026-10-20',
    isSold: true,
    createdAt: Date.now(),
  };

  const result = calculateAssetProfitLoss(carTrade);
  assert.equal(result.cost, 360000);
  assert.equal(result.revenue, 410000);
  assert.equal(result.profitLoss, 50000);
  assert.equal(result.profitPercentage, 13.9);
});

test('calculateAssetProfitLoss handles unsold asset correctly', () => {
  const unsoldCar: AssetTradeTransaction = {
    id: 'tx-car-2',
    type: 'asset_trade',
    title: 'ซื้อรถยนต์รอขาย Mazda 2',
    assetCategory: 'car',
    buyPrice: 280000,
    buyDate: '2026-10-15',
    date: '2026-10-15',
    isSold: false,
    createdAt: Date.now(),
  };

  const result = calculateAssetProfitLoss(unsoldCar);
  assert.equal(result.cost, 280000);
  assert.equal(result.revenue, 0);
  assert.equal(result.profitLoss, 0);
  assert.equal(result.profitPercentage, 0);
});

test('calculateInvestmentProfitLoss calculates stock gains and dividends', () => {
  const stockInv: InvestmentTransaction = {
    id: 'tx-stock-1',
    type: 'investment',
    title: 'ลงทุนหุ้น DELTA & PTT',
    investmentCategory: 'stock_thai',
    investedAmount: 25000,
    currentValuation: 27800,
    dividendReceived: 500,
    status: 'holding',
    date: '2026-10-05',
    createdAt: Date.now(),
  };

  const result = calculateInvestmentProfitLoss(stockInv);
  assert.equal(result.cost, 25000);
  assert.equal(result.currentValue, 27800);
  assert.equal(result.dividend, 500);
  assert.equal(result.profitLoss, 3300);
  assert.equal(result.profitPercentage, 13.2);
});

test('calculateBudgetStatus triggers caution at 80% and exceeded at 100%+', () => {
  const normal = calculateBudgetStatus(15000, 30000, 80);
  assert.equal(normal.percentUsed, 50);
  assert.equal(normal.isCaution, false);
  assert.equal(normal.isExceeded, false);
  assert.equal(normal.remainingAmount, 15000);

  const caution = calculateBudgetStatus(25000, 30000, 80);
  assert.equal(caution.isCaution, true);
  assert.equal(caution.isExceeded, false);
  assert.equal(caution.remainingAmount, 5000);

  const exceeded = calculateBudgetStatus(34500, 30000, 80);
  assert.equal(exceeded.isCaution, false);
  assert.equal(exceeded.isExceeded, true);
  assert.equal(exceeded.overAmount, 4500);
});

test('calculateMonthlySummary aggregates cashflow, car flips, stock gains and major monthly expenses', () => {
  const budget: MonthlyBudget = {
    monthKey: '2026-10',
    amount: 35000,
    cautionPercent: 80,
    alertEnabled: true,
  };

  const majorExpense1: MajorExpenseTransaction = {
    id: 'e1',
    type: 'major_expense',
    title: 'ผ่อนคอนโด',
    category: 'housing',
    amount: 12500,
    date: '2026-10-03',
    isPaid: true,
    createdAt: Date.now(),
  };

  const income1: StandardIncomeTransaction = {
    id: 'i1',
    type: 'income',
    title: 'เงินเดือน',
    category: 'salary',
    amount: 55000,
    date: '2026-10-25',
    createdAt: Date.now(),
  };

  const carFlip: AssetTradeTransaction = {
    id: 'a1',
    type: 'asset_trade',
    title: 'ซื้อขายรถยนต์ Toyota Yaris',
    assetCategory: 'car',
    buyPrice: 200000,
    sellPrice: 235000,
    isSold: true,
    buyDate: '2026-10-02',
    sellDate: '2026-10-18',
    date: '2026-10-18',
    createdAt: Date.now(),
  };

  const stockInv: InvestmentTransaction = {
    id: 'inv1',
    type: 'investment',
    title: 'หุ้นเทคโนโลยี AI',
    investmentCategory: 'stock_foreign',
    investedAmount: 20000,
    currentValuation: 24000,
    dividendReceived: 0,
    status: 'holding',
    date: '2026-10-10',
    createdAt: Date.now(),
  };

  const summary = calculateMonthlySummary([majorExpense1, income1, carFlip, stockInv], '2026-10', budget);

  assert.equal(summary.totalMajorExpenses, 12500);
  assert.equal(summary.paidExpenses, 12500);
  assert.equal(summary.unpaidExpenses, 0);
  assert.equal(summary.totalIncome, 55000);
  assert.equal(summary.netCashFlow, 42500); // 55000 - 12500
  assert.equal(summary.assetRealizedProfitLoss, 35000); // 235000 - 200000
  assert.equal(summary.investmentProfitLoss, 4000); // 24000 - 20000
  // Total profit: 42500 + 35000 + 4000 = 81500
  assert.equal(summary.overallProfitLoss, 81500);
});

test('formatThaiCurrency formats positive and negative figures properly', () => {
  assert.equal(formatThaiCurrency(1500), '฿1,500');
  assert.equal(formatThaiCurrency(25000, true), '+฿25,000');
  assert.equal(formatThaiCurrency(-4200, true), '-฿4,200');
});
