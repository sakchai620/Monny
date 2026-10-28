import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Car,
  LineChart,
  CreditCard,
  Plus,
  Bell,
  Sliders,
  Smartphone,
  Download,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  Sun,
  Moon,
  Share2,
  Sparkles,
  RotateCcw,
  Wallet,
} from 'lucide-react';

import {
  Transaction,
  MonthlyBudget,
  NotificationLog,
  TransactionType,
  AssetTradeTransaction,
  InvestmentTransaction,
  MajorExpenseTransaction,
  StandardIncomeTransaction,
} from './types/finance';
import {
  INITIAL_TRANSACTIONS,
  DEFAULT_BUDGET,
  CURRENT_MONTH_KEY,
} from './data/initialData';
import {
  calculateMonthlySummary,
  formatThaiCurrency,
  formatThaiMonth,
  formatThaiMonthShort,
} from './utils/financeCalculations';
import {
  soundEffects,
  sendBrowserNotification,
  requestNotificationPermission,
} from './utils/notificationService';

import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase.ts';
import { saveSupabaseTransaction, deleteSupabaseTransaction, syncSupabaseTransactions } from './lib/supabase.ts';

// Modular Components
import { BudgetBanner } from './components/BudgetBanner';
import { ProfitLossOverview } from './components/ProfitLossOverview';
import { ExpenseDonutChart } from './components/ExpenseDonutChart';
import { IncomesList } from './components/IncomesList';
import { MajorExpensesList } from './components/MajorExpensesList';
import { InlineQuickAddCard } from './components/InlineQuickAddCard';
import { AllTransactionsList } from './components/AllTransactionsList';
import { AddTransactionModal } from './components/AddTransactionModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { NotificationModal } from './components/NotificationModal';
import { ShareableFinancialCard } from './components/ShareableFinancialCard';

export default function App() {
  // Theme state: Default to Clean Transparent Light Glass
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('monthly_expense_theme');
      if (saved) return saved === 'dark';
    } catch {}
    return false;
  });

  // Persistence state - Clean slate (เริ่มต้นที่ 0 ไม่มีข้อมูลจำลอง)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      localStorage.removeItem('monthly_major_transactions_v2');
      const saved = localStorage.getItem('monthly_major_transactions_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSACTIONS; // []
  });

  const [budget, setBudget] = useState<MonthlyBudget>(() => {
    try {
      localStorage.removeItem('monthly_major_budget_v2');
      const saved = localStorage.getItem('monthly_major_budget_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_BUDGET; // amount: 0
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH_KEY);
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'major_expense' | 'all'>('overview');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auto Sync Supabase on App Mount
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const supabaseData = await syncSupabaseTransactions(currentUser?.uid || 'guest');
        if (supabaseData && supabaseData.length > 0) {
          setTransactions(supabaseData);
        }
      } catch (err) {
        console.warn('Initial Supabase fetch error:', err);
      }
    };
    loadFromSupabase();
  }, []);

  // Sync Firebase Auth with Cloud SQL & Supabase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const supabaseData = await syncSupabaseTransactions(user.uid);
          if (supabaseData && supabaseData.length > 0) {
            setTransactions(supabaseData);
          }

          const token = await user.getIdToken();
          // Sync user record to PostgreSQL API
          await fetch('/api/users/sync', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});

          // Fetch transactions from Cloud SQL API if available
          const res = await fetch('/api/transactions', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);

          if (res && res.ok) {
            const data = await res.json();
            if (data && data.length > 0) setTransactions(data);
          }

          // Fetch budget from Cloud SQL API
          const bRes = await fetch(`/api/budget?monthKey=${selectedMonth}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);

          if (bRes && bRes.ok) {
            const bData = await bRes.json();
            setBudget(bData);
          }
        } catch (err) {
          console.error('Cloud SQL / Supabase sync error:', err);
        }
      }
    });
    return () => unsubscribe();
  }, [selectedMonth]);

  // UI Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultType, setAddModalDefaultType] = useState<TransactionType>('major_expense');
  const [isBudgetSettingsOpen, setIsBudgetSettingsOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);

  // Quick action targets
  const [quickSellTrade, setQuickSellTrade] = useState<AssetTradeTransaction | null>(null);
  const [quickUpdateInvestment, setQuickUpdateInvestment] = useState<InvestmentTransaction | null>(null);

  // Notifications log & in-app floating banner
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [activeBannerAlert, setActiveBannerAlert] = useState<{
    type: 'caution' | 'exceeded' | 'profit';
    title: string;
    message: string;
  } | null>(null);

  // Viewport mode
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(false);

  // Track previous spent amount to trigger alerts on threshold cross
  const prevSpentRef = useRef<number | null>(null);

  // Reset all data to 0
  const handleResetAllToZero = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('คุณต้องการล้างข้อมูลทั้งหมดให้เป็น 0 เพื่อเริ่มบันทึกใหม่ด้วยตนเอง ใช่หรือไม่?');
      if (!confirmed) return;
    }
    setTransactions([]);
    setBudget({
      monthKey: selectedMonth,
      amount: 0,
      cautionPercent: 80,
      alertEnabled: true,
    });
    try {
      localStorage.setItem('monthly_major_transactions_v3', JSON.stringify([]));
      localStorage.setItem(
        'monthly_major_budget_v3',
        JSON.stringify({
          monthKey: selectedMonth,
          amount: 0,
          cautionPercent: 80,
          alertEnabled: true,
        })
      );
      localStorage.removeItem('monthly_major_transactions_v2');
      localStorage.removeItem('monthly_major_budget_v2');
    } catch {}
    setActiveBannerAlert({
      type: 'profit',
      title: 'ล้างข้อมูลเป็น 0 เรียบร้อย',
      message: 'ระบบได้ล้างข้อมูลออกทั้งหมดแล้ว คุณสามารถเริ่มบันทึกข้อมูลจริงด้วยตนเองได้ทันที',
    });
  };

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('monthly_major_transactions_v3', JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('monthly_major_budget_v3', JSON.stringify(budget));
    } catch {}
  }, [budget]);

  useEffect(() => {
    try {
      localStorage.setItem('monthly_expense_theme', isDarkMode ? 'dark' : 'light');
    } catch {}
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Financial summary for selected month
  const summary = useMemo(() => {
    return calculateMonthlySummary(transactions, selectedMonth, budget);
  }, [transactions, selectedMonth, budget]);

  // Check budget thresholds when expenses update
  useEffect(() => {
    const currentSpent = summary.budgetStatus.spentAmount;
    const prevSpent = prevSpentRef.current;
    prevSpentRef.current = currentSpent;

    if (prevSpent === null) return;
    if (!budget.alertEnabled) return;

    const { isExceeded, isCaution, overAmount, percentUsed, remainingAmount } = summary.budgetStatus;

    if (isExceeded && currentSpent > prevSpent) {
      soundEffects.playBudgetExceeded();
      sendBrowserNotification('🚨 ค่าใช้จ่ายหลักเกินงบประมาณแล้ว!', {
        body: `คุณมีค่าใช้จ่ายหลักเกินงบไปแล้ว ${formatThaiCurrency(overAmount)} (รวม ${formatThaiCurrency(currentSpent)})`,
      });

      const newLog: NotificationLog = {
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        type: 'budget_exceeded',
        title: '🚨 ค่าใช้จ่ายหลักเกินงบประมาณแล้ว!',
        message: `ยอดรวม ${formatThaiCurrency(currentSpent)} เกินงบ ${formatThaiCurrency(budget.amount)} ไปแล้ว +${formatThaiCurrency(overAmount)}`,
        read: false,
      };
      setNotificationLogs((prev) => [newLog, ...prev]);

      setActiveBannerAlert({
        type: 'exceeded',
        title: 'แจ้งเตือนด่วน: ค่าใช้จ่ายหลักเกินงบ!',
        message: `ยอดรวม ${formatThaiCurrency(currentSpent)} เกินงบที่ตั้งไว้ไปแล้ว +${formatThaiCurrency(overAmount)}`,
      });
    } else if (isCaution && currentSpent > prevSpent && (prevSpent / budget.amount) * 100 < budget.cautionPercent) {
      soundEffects.playCaution();
      sendBrowserNotification('⚠️ ค่าใช้จ่ายหลักใกล้ถึงขีดจำกัดงบ', {
        body: `ใช้ไปแล้ว ${percentUsed.toFixed(1)}% คงเหลืออีก ${formatThaiCurrency(remainingAmount)}`,
      });

      const newLog: NotificationLog = {
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        type: 'budget_caution',
        title: '⚠️ ค่าใช้จ่ายหลักใกล้ถึงขีดจำกัดงบ',
        message: `ใช้ไปแล้ว ${percentUsed.toFixed(1)}% คงเหลืออีก ${formatThaiCurrency(remainingAmount)}`,
        read: false,
      };
      setNotificationLogs((prev) => [newLog, ...prev]);

      setActiveBannerAlert({
        type: 'caution',
        title: 'เตือนระวัง: ค่าใช้จ่ายหลักแตะเกณฑ์ระวัง',
        message: `ใช้ไปแล้ว ${percentUsed.toFixed(1)}% ของงบ เหลือเงินใช้ได้อีก ${formatThaiCurrency(remainingAmount)}`,
      });
    }
  }, [summary.budgetStatus, budget]);

  // Handlers
  const handleAddTransaction = async (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);

    if (newTx.type === 'income') {
      soundEffects.playProfitChime();
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    }

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTx),
        });
        await saveSupabaseTransaction(currentUser.uid, newTx);
      } catch (err) {
        console.error('Error saving transaction to Cloud SQL / Supabase:', err);
      }
    } else {
      await saveSupabaseTransaction('guest', newTx);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        await deleteSupabaseTransaction(currentUser.uid, id);
      } catch (err) {
        console.error('Error deleting transaction from Cloud SQL / Supabase:', err);
      }
    } else {
      await deleteSupabaseTransaction('guest', id);
    }
  };

  const handleTogglePaidExpense = async (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id && tx.type === 'major_expense') {
          return {
            ...tx,
            isPaid: !tx.isPaid,
          };
        }
        return tx;
      })
    );

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await fetch(`/api/transactions/${id}/toggle-paid`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Error toggling transaction in Cloud SQL:', err);
      }
    }
  };

  const handleSaveBudget = async (newBudget: MonthlyBudget) => {
    setBudget(newBudget);

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await fetch('/api/budget', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newBudget),
        });
      } catch (err) {
        console.error('Error saving budget to Cloud SQL:', err);
      }
    }
  };

  const handleQuickSellConfirm = (tradeId: string, sellPrice: number, sellDate: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === tradeId && tx.type === 'asset_trade') {
          const updated: AssetTradeTransaction = {
            ...tx,
            isSold: true,
            sellPrice,
            sellDate,
            date: sellDate,
          };
          const profit = sellPrice - (tx.buyPrice + (tx.maintenanceCost || 0));
          if (profit > 0) {
            soundEffects.playProfitChime();
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          }
          return updated;
        }
        return tx;
      })
    );
  };

  const handleQuickUpdateValuationConfirm = (
    investmentId: string,
    currentValuation: number,
    dividendReceived?: number
  ) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === investmentId && tx.type === 'investment') {
          const updated: InvestmentTransaction = {
            ...tx,
            currentValuation,
            dividendReceived: dividendReceived !== undefined ? dividendReceived : tx.dividendReceived,
          };
          if (currentValuation > tx.investedAmount) {
            soundEffects.playProfitChime();
            confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
          }
          return updated;
        }
        return tx;
      })
    );
  };

  const handleTestNotification = async () => {
    soundEffects.playBudgetExceeded();
    confetti({ particleCount: 50, spread: 45, origin: { y: 0.5 } });

    await requestNotificationPermission();

    const title = '🚨 แจ้งเตือนทดสอบ: ค่าใช้จ่ายหลักเกินงบประมาณ!';
    const message = `คุณได้ทดสอบระบบแจ้งเตือนของแอพ "ค่าใช้จ่ายภายในเดือนนี้" เรียบร้อยแล้ว`;

    sendBrowserNotification(title, { body: message });

    setNotificationLogs((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        type: 'test',
        title,
        message,
        read: false,
      },
      ...prev,
    ]);

    setActiveBannerAlert({
      type: 'exceeded',
      title: 'ทดสอบส่งการแจ้งเตือนสำเร็จ!',
      message: 'ระบบเสียงเตือนและระบบส่งแจ้งเตือนทำงานได้อย่างสมบูรณ์',
    });
  };

  const openAddModal = (type: TransactionType = 'major_expense') => {
    setAddModalDefaultType(type);
    setIsAddModalOpen(true);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ transactions, budget }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_major_finances_${selectedMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthOptions = ['2026-10', '2026-09', '2026-08'];

  const incomesCount = transactions.filter(
    (t): t is StandardIncomeTransaction => t.type === 'income' && t.date.startsWith(selectedMonth)
  ).length;

  const assetTradesCount = transactions.filter(
    (t): t is AssetTradeTransaction => t.type === 'asset_trade' && t.date.startsWith(selectedMonth)
  ).length;

  const investmentsCount = transactions.filter(
    (t): t is InvestmentTransaction => t.type === 'investment' && t.date.startsWith(selectedMonth)
  ).length;

  const majorExpensesCount = transactions.filter(
    (t): t is MajorExpenseTransaction => t.type === 'major_expense' && t.date.startsWith(selectedMonth)
  ).length;

  return (
    <div
      className={`min-h-screen relative flex flex-col items-center justify-start antialiased selection:bg-pink-500 selection:text-white transition-colors duration-300 ${
        isDarkMode ? 'dark bg-gradient-dark-mesh text-slate-100' : 'bg-gradient-pink-mesh text-slate-900'
      }`}
    >
      {/* Custom Romantic Background Photo Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 scale-105 opacity-90"
          style={{ backgroundImage: `url('/bg-couple.png')` }}
        />
        {/* Soft Glass Tint Overlay for readability */}
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            isDarkMode
              ? 'bg-slate-950/80 backdrop-blur-[3px]'
              : 'bg-gradient-to-b from-pink-100/80 via-white/75 to-pink-100/85 backdrop-blur-[2px]'
          }`}
        />
      </div>

      {/* Top Header Bar */}
      <header
        className={`relative z-30 w-full max-w-4xl px-3 sm:px-5 py-2.5 sm:py-3.5 border-b backdrop-blur-2xl sticky top-0 transition-colors animate-neon-running ${
          isDarkMode
            ? 'border-pink-500/35 bg-slate-900/85'
            : 'border-pink-300/70 bg-white/85 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Dancing Mascot Bear Doll / Icon */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white text-base sm:text-lg shrink-0 shadow-md shadow-pink-600/40 animate-dance border border-white/40">
              🐻
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <h1 className="text-xs sm:text-base font-bold tracking-tight text-slate-800 dark:text-white whitespace-nowrap">
                  <span className="inline sm:hidden">ค่าใช้จ่ายเดือนนี้</span>
                  <span className="hidden sm:inline">ค่าใช้จ่ายภายในเดือนนี้</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-500/25 shrink-0">
                  ✨ ธีมชมพูวิบวับ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                ค่าหลักประจำเดือน · ซื้อขายรถ · กำไรพอร์ตหุ้น (ไม่มีรายวัน)
              </p>
            </div>
          </div>

          {/* Action icons & controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Month Dropdown in sleek capsule */}
            <div className="relative">
              <select
                aria-label="เลือกเดือน"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={`appearance-none pl-2.5 sm:pl-3 pr-6 sm:pr-7 py-1.5 rounded-xl text-xs font-semibold focus:outline-none border cursor-pointer transition-all min-w-[96px] sm:min-w-[110px] ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-white/10 text-white hover:border-white/20'
                    : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-xs hover:border-slate-300'
                }`}
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m} className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
                    {formatThaiMonth(m)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>



            {/* Theme Toggle (Light / Dark Glass) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="สลับธีมโปร่งใส"
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-slate-800/80 border-white/10 text-amber-300 hover:bg-slate-800'
                  : 'bg-white/90 border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-xs hover:bg-white'
              }`}
              title={isDarkMode ? 'เปลี่ยนเป็นกระจกใสสว่าง' : 'เปลี่ยนเป็นกระจกใสดาร์ก'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              aria-label="การแจ้งเตือน"
              className={`relative p-2 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-slate-800/80 border-white/10 text-slate-300 hover:text-amber-300'
                  : 'bg-white/90 border-slate-200/90 text-slate-600 hover:text-amber-600 shadow-xs'
              }`}
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {notificationLogs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {notificationLogs.length}
                </span>
              )}
            </button>

            {/* Budget Settings */}
            <button
              onClick={() => setIsBudgetSettingsOpen(true)}
              aria-label="ตั้งค่างบประมาณ"
              className={`p-2 rounded-xl border transition-all hidden xs:flex ${
                isDarkMode
                  ? 'bg-slate-800/80 border-white/10 text-slate-300 hover:text-white'
                  : 'bg-white/90 border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Phone Frame Toggle */}
            <button
              onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
              aria-label="สลับโหมดกรอบโทรศัพท์"
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isDarkMode
                  ? 'bg-slate-800/80 border-white/10 text-slate-300 hover:text-white'
                  : 'bg-white/90 border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isPhoneFrameMode ? 'เต็มหน้าจอ' : 'จอมือถือ'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Alert Banner */}
      {activeBannerAlert && (
        <div className="w-full max-w-lg px-4 pt-3 z-40 animate-slide-down">
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-lg backdrop-blur-xl ${
              activeBannerAlert.type === 'exceeded'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-900 dark:text-rose-200'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {activeBannerAlert.type === 'exceeded' ? (
                <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold">{activeBannerAlert.title}</h4>
              <p className="mt-0.5">{activeBannerAlert.message}</p>
            </div>
            <button
              onClick={() => setActiveBannerAlert(null)}
              className="text-slate-400 hover:text-slate-700 p-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main
        className={`w-full transition-all duration-300 flex-1 flex flex-col items-center ${
          isPhoneFrameMode
            ? 'max-w-md my-4 p-4 rounded-[42px] border-[8px] border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 shadow-2xl relative min-h-[844px]'
            : 'max-w-3xl px-4 py-4 sm:py-6'
        }`}
      >
        {isPhoneFrameMode && (
          <div className="w-full flex items-center justify-between pb-3 px-3 text-[11px] text-slate-400 font-mono select-none">
            <span>09:41</span>
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
            <div className="flex items-center gap-1">5G 100%</div>
          </div>
        )}

        <div className="w-full space-y-4 pb-24">
          {/* 2. High-Contrast Segmented Control Tab Bar */}
          <div
            className={`p-2 rounded-2xl border-2 text-xs overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2 shadow-xl backdrop-blur-md min-w-0 ${
              isDarkMode
                ? 'bg-slate-900/95 border-pink-500/40 text-slate-100 shadow-slate-950/80'
                : 'bg-white/98 border-pink-300 text-slate-900 shadow-pink-200/60'
            }`}
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[85px] sm:min-w-0 whitespace-nowrap py-2.5 px-3 rounded-xl font-extrabold transition-all text-center text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer border ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white border-pink-400 shadow-md shadow-pink-500/40 scale-102 ring-2 ring-pink-300/80'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-700/80 hover:bg-pink-100/80 dark:hover:bg-slate-700 hover:text-pink-700 dark:hover:text-pink-300 shadow-2xs'
              }`}
            >
              <span>📊 ภาพรวม</span>
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 min-w-[85px] sm:min-w-0 whitespace-nowrap py-2.5 px-3 rounded-xl font-extrabold transition-all text-center flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer border ${
                activeTab === 'income'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/40 scale-102 ring-2 ring-emerald-300/80'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-700/80 hover:bg-emerald-100/80 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-300 shadow-2xs'
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>เงินเข้า</span>
              <span
                className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  activeTab === 'income'
                    ? 'bg-white/30 text-white shadow-xs'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50'
                }`}
              >
                {incomesCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('major_expense')}
              className={`flex-1 min-w-[85px] sm:min-w-0 whitespace-nowrap py-2.5 px-3 rounded-xl font-extrabold transition-all text-center flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer border ${
                activeTab === 'major_expense'
                  ? 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white border-rose-400 shadow-md shadow-rose-500/40 scale-102 ring-2 ring-rose-300/80'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-700/80 hover:bg-rose-100/80 dark:hover:bg-slate-700 hover:text-rose-700 dark:hover:text-rose-300 shadow-2xs'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>รายจ่าย</span>
              <span
                className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  activeTab === 'major_expense'
                    ? 'bg-white/30 text-white shadow-xs'
                    : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50'
                }`}
              >
                {majorExpensesCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 min-w-[85px] sm:min-w-0 whitespace-nowrap py-2.5 px-3 rounded-xl font-extrabold transition-all text-center flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer border ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 text-white border-indigo-400 shadow-md shadow-indigo-600/40 scale-102 ring-2 ring-indigo-300/80'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-700/80 hover:bg-indigo-100/80 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-300 shadow-2xs'
              }`}
            >
              <span>📋 ทั้งหมด</span>
              <span
                className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-white/30 text-white shadow-xs'
                    : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50'
                }`}
              >
                {transactions.length}
              </span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Graphical Cash Flow & Balance Overview */}
              <ProfitLossOverview
                summary={summary}
                isDarkMode={isDarkMode}
                onAddNew={(type) => openAddModal(type)}
                onSelectTab={(tab) => {
                  if (tab === 'income') setActiveTab('income');
                  else if (tab === 'expense') setActiveTab('major_expense');
                  else if (tab === 'all') setActiveTab('all');
                }}
              />

              {/* แบบเพิ่มในหน้าเดียวไปเลย: บันทึกรายการด่วน (พร้อมดรอปดาวน์ให้เลือก หรือพิมพ์เอง) */}
              <InlineQuickAddCard
                isDarkMode={isDarkMode}
                onAdd={handleAddTransaction}
              />

              {/* Major Monthly Bills Category Breakdown */}
              <ExpenseDonutChart
                transactions={transactions}
                monthKey={selectedMonth}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* TAB 2: INCOMES (เงินเข้า / รายรับเดือนนี้) */}
          {activeTab === 'income' && (
            <IncomesList
              incomes={transactions.filter(
                (t): t is StandardIncomeTransaction =>
                  t.type === 'income' && t.date.startsWith(selectedMonth)
              )}
              isDarkMode={isDarkMode}
              onDelete={handleDeleteTransaction}
              onAddNew={() => openAddModal('income')}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {/* TAB 3: EXPENSES (รายจ่าย/ค่าใช้จ่ายหลักประจำเดือน) */}
          {activeTab === 'major_expense' && (
            <MajorExpensesList
              expenses={transactions.filter(
                (t): t is MajorExpenseTransaction =>
                  t.type === 'major_expense' && t.date.startsWith(selectedMonth)
              )}
              isDarkMode={isDarkMode}
              onTogglePaid={handleTogglePaidExpense}
              onDelete={handleDeleteTransaction}
              onAddNew={() => openAddModal('major_expense')}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {/* TAB 4: ALL TRANSACTIONS (ดูประวัติและค้นหาทุกรายการ) */}
          {activeTab === 'all' && (
            <AllTransactionsList
              transactions={transactions.filter((t) => t.date.startsWith(selectedMonth))}
              isDarkMode={isDarkMode}
              onTogglePaid={handleTogglePaidExpense}
              onDelete={handleDeleteTransaction}
              onAddNew={() => openAddModal('major_expense')}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {/* Quick Share Banner & Backup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsShareCardOpen(true)}
                className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>แชร์รายงานสรุป</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={handleResetAllToZero}
                className="flex items-center gap-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium"
                title="ล้างข้อมูลทั้งหมดให้เป็น 0 เพื่อเริ่มบันทึกใหม่ด้วยตนเอง"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้างค่าเป็น 0</span>
              </button>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors font-medium self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออกไฟล์สำรอง (JSON)</span>
            </button>
          </div>
        </div>



        {isPhoneFrameMode && (
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-auto pt-0.5 mb-1" />
        )}
      </main>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
        defaultType={addModalDefaultType}
      />

      <BudgetSettingsModal
        isOpen={isBudgetSettingsOpen}
        onClose={() => setIsBudgetSettingsOpen(false)}
        budget={budget}
        onSaveBudget={setBudget}
        onTestNotification={handleTestNotification}
        onResetAllToZero={handleResetAllToZero}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notificationLogs}
        onClearAll={() => setNotificationLogs([])}
        onTestNotification={handleTestNotification}
      />

      <ShareableFinancialCard
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        summary={summary}
        transactions={transactions}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
