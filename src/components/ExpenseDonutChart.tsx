import React, { useState } from 'react';
import { PieChart, Home, Car, Zap, ShieldCheck, CreditCard, GraduationCap, Wrench, MoreHorizontal } from 'lucide-react';
import { Transaction, MajorExpenseCategory } from '../types/finance';
import { getMajorExpenseCategoryBreakdown, formatThaiCurrency } from '../utils/financeCalculations';

interface ExpenseDonutChartProps {
  transactions: Transaction[];
  monthKey: string;
  isDarkMode?: boolean;
}

export const ExpenseDonutChart: React.FC<ExpenseDonutChartProps> = ({
  transactions,
  monthKey,
  isDarkMode = false,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const categories = getMajorExpenseCategoryBreakdown(transactions, monthKey);
  const totalExpense = categories.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = categories.reduce((sum, item) => sum + item.paidAmount, 0);

  const getCategoryIcon = (cat: MajorExpenseCategory) => {
    switch (cat) {
      case 'housing':
        return <Home className="w-3.5 h-3.5" />;
      case 'car_installment':
        return <Car className="w-3.5 h-3.5" />;
      case 'utilities':
        return <Zap className="w-3.5 h-3.5" />;
      case 'insurance':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'debt_loan':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'education':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'maintenance':
        return <Wrench className="w-3.5 h-3.5" />;
      default:
        return <MoreHorizontal className="w-3.5 h-3.5" />;
    }
  };

  const size = 150;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  if (categories.length === 0 || totalExpense === 0) {
    return (
      <div
        style={{
          backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        className={`rounded-3xl p-6 border-2 text-center shadow-xl ${
          isDarkMode
            ? 'bg-slate-900 border-pink-500/30 text-white glass-card-dark'
            : 'bg-white border-pink-300/70 text-slate-800 glass-card-light'
        }`}
      >
        <PieChart className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">ยังไม่มีค่าใช้จ่ายหลักในเดือนนี้</h4>
        <p className="text-xs text-slate-500 mt-1">
          แตะปุ่ม "เพิ่มค่าใช้จ่ายหลัก" เพื่อบันทึกค่าผ่อนบ้าน ค่างวดรถ หรือประกัน
        </p>
      </div>
    );
  }

  const activeItem = hoveredCategory
    ? categories.find((c) => c.category === hoveredCategory)
    : null;

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      className={`rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-xl ${
        isDarkMode
          ? 'bg-slate-900 border-pink-500/30 text-white glass-card-dark'
          : 'bg-white border-pink-300/70 text-slate-800 glass-card-light'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-600">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              สัดส่วนค่าใช้จ่ายหลักประจำเดือน
            </h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* SVG Donut */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {categories.map((cat) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativeOffset;
              cumulativeOffset += (cat.percentage / 100) * circumference;

              const isHovered = hoveredCategory === cat.category;

              return (
                <circle
                  key={cat.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(cat.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            {activeItem ? (
              <>
                <span className="text-[10px] text-slate-500 line-clamp-1">{activeItem.label}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {formatThaiCurrency(activeItem.amount)}
                </span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {activeItem.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] text-slate-500">ค่าหลักรวม</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {formatThaiCurrency(totalExpense)}
                </span>
                <span className="text-[10px] text-slate-500">{categories.length} รายการหลัก</span>
              </>
            )}
          </div>
        </div>

        {/* Category List & Progress Bars */}
        <div className="w-full space-y-2 flex-1">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.category;
            const isFullyPaid = cat.paidAmount >= cat.amount;

            return (
              <div
                key={cat.category}
                onMouseEnter={() => setHoveredCategory(cat.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`p-2 rounded-2xl transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-100/80 dark:bg-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-500">{getCategoryIcon(cat.category)}</span>
                    <span className="font-semibold text-xs truncate max-w-[130px] sm:max-w-none">
                      {cat.label}
                    </span>
                    {isFullyPaid && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        จ่ายครบแล้ว
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-white font-num tabular-nums">
                      {formatThaiCurrency(cat.amount)}
                    </span>
                    <span className="text-[11px] text-slate-500 w-9 text-right font-medium font-num">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress track */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
