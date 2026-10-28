import React, { useState } from 'react';
import {
  Wallet,
  CreditCard,
  Search,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import {
  Transaction,
  MajorExpenseTransaction,
  StandardIncomeTransaction,
} from '../types/finance';
import { formatThaiCurrency, formatThaiDate } from '../utils/financeCalculations';

interface AllTransactionsListProps {
  transactions: Transaction[];
  isDarkMode?: boolean;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onBackToOverview?: () => void;
}

export const AllTransactionsList: React.FC<AllTransactionsListProps> = ({
  transactions,
  isDarkMode = false,
  onTogglePaid,
  onDelete,
  onAddNew,
  onBackToOverview,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'income' && tx.type !== 'income') return false;
    if (filterType === 'expense' && tx.type !== 'major_expense') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!tx.title.toLowerCase().includes(q) && !tx.note?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Navigation Back Bar */}
      {onBackToOverview && (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackToOverview}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>← ย้อนกลับไปหน้าภาพรวม</span>
          </button>
        </div>
      )}
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อรายการ หรือ หมายเหตุ..."
            className={`w-full py-2.5 pl-9 pr-4 rounded-2xl border text-xs outline-none transition-all ${
              isDarkMode
                ? 'bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div
          className={`p-1 rounded-2xl border flex items-center gap-1 self-start sm:self-auto ${
            isDarkMode ? 'bg-slate-900/80 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ทั้งหมด ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'income'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            เงินเข้า
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'expense'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            รายจ่าย
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          style={{
            backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className={`rounded-3xl p-8 border text-center ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
            ยังไม่มีรายการในหมวดนี้
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            คุณสามารถเพิ่มเงินเข้า หรือ บันทึกรายจ่ายผ่านกล่องด้านบนได้เลย
          </p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ บันทึกรายการ</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            const incomeTx = isIncome ? (tx as StandardIncomeTransaction) : null;
            const expenseTx = !isIncome ? (tx as MajorExpenseTransaction) : null;
            const amount = incomeTx ? incomeTx.amount : expenseTx ? expenseTx.amount : 0;

            return (
              <div
                key={tx.id}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
                className={`rounded-2xl p-4 border transition-all flex items-center justify-between gap-3 ${
                  isDarkMode
                    ? 'glass-card-dark hover:border-white/20'
                    : 'glass-card-light hover:border-slate-300'
                }`}
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <Wallet className="w-5 h-5" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {tx.title}
                      </h4>
                      {expenseTx && (
                        <button
                          type="button"
                          onClick={() => onTogglePaid(tx.id)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                            expenseTx.isPaid
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {expenseTx.isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> จ่ายแล้ว
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> รอดำเนินการ
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatThaiDate(tx.date)}
                      </span>
                      {tx.note && (
                        <span>· {tx.note}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-extrabold font-num tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatThaiCurrency(amount)}
                    </div>
                  </div>

                  <button
                    onClick={() => onDelete(tx.id)}
                    aria-label={`ลบรายการ ${tx.title}`}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
