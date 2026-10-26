import React, { useState } from 'react';
import {
  Wallet,
  CreditCard,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  Transaction,
  MajorExpenseCategory,
  IncomeCategory,
} from '../types/finance';
import { soundEffects } from '../utils/notificationService';

interface InlineQuickAddCardProps {
  isDarkMode?: boolean;
  onAdd: (transaction: Transaction) => void;
}

const EXPENSE_PRESETS: { title: string; category: MajorExpenseCategory; icon: string }[] = [
  { title: 'งวดรถยนต์', category: 'car_installment', icon: '🚗' },
  { title: 'ค่าห้อง / ค่าเช่า / ผ่อนบ้าน', category: 'housing', icon: '🏠' },
  { title: 'ค่าน้ำ - ค่าไฟ', category: 'utilities', icon: '💡' },
  { title: 'ค่าเน็ต / ค่าโทรศัพท์', category: 'utilities', icon: '📶' },
  { title: 'บัตรเครดิต / ชำระหนี้', category: 'debt_loan', icon: '💳' },
  { title: 'เบี้ยประกันชีวิต / ประกันรถ', category: 'insurance', icon: '🛡️' },
  { title: 'ค่าส่วนกลาง', category: 'maintenance', icon: '🏢' },
  { title: 'ค่าอาหาร / ของใช้ประจำวัน', category: 'other_major', icon: '🍱' },
  { title: 'ค่าน้ำมัน / ค่าเดินทาง', category: 'other_major', icon: '⛽' },
];

const INCOME_PRESETS: { title: string; category: IncomeCategory; icon: string }[] = [
  { title: 'เงินเดือนประจำ', category: 'salary', icon: '💼' },
  { title: 'รายได้ธุรกิจ / ค้าขาย', category: 'business', icon: '🛍️' },
  { title: 'งานฟรีแลนซ์ / รับจ้าง', category: 'freelance', icon: '💻' },
  { title: 'โบนัส / เงินพิเศษ', category: 'bonus', icon: '🎁' },
  { title: 'เงินโอนเข้า / รายรับอื่นๆ', category: 'other', icon: '💰' },
];

export const InlineQuickAddCard: React.FC<InlineQuickAddCardProps> = ({
  isDarkMode = false,
  onAdd,
}) => {
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState(true);
  const [expenseCategory, setExpenseCategory] = useState<MajorExpenseCategory>('car_installment');
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('salary');
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Handle Preset Dropdown Selection
  const handleDropdownSelect = (value: string) => {
    setSelectedPreset(value);
    if (!value) return;

    if (txType === 'expense') {
      const found = EXPENSE_PRESETS.find((p) => p.title === value);
      if (found) {
        setTitle(found.title);
        setExpenseCategory(found.category);
      }
    } else {
      const found = INCOME_PRESETS.find((p) => p.title === value);
      if (found) {
        setTitle(found.title);
        setIncomeCategory(found.category);
      }
    }
  };

  // Quick Chip Click
  const handleChipClick = (presetTitle: string, category: any) => {
    setTitle(presetTitle);
    setSelectedPreset(presetTitle);
    if (txType === 'expense') {
      setExpenseCategory(category);
    } else {
      setIncomeCategory(category);
    }
  };

  const handleAddAmount = (extra: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + extra).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (!title.trim() || parsedAmount <= 0) return;

    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (txType === 'income') {
      onAdd({
        id,
        type: 'income',
        title: title.trim(),
        amount: parsedAmount,
        category: incomeCategory,
        date,
        note: note.trim() || undefined,
        createdAt: Date.now(),
      });
    } else {
      onAdd({
        id,
        type: 'major_expense',
        title: title.trim(),
        amount: parsedAmount,
        category: expenseCategory,
        isPaid,
        date,
        dueDate: date,
        note: note.trim() || undefined,
        createdAt: Date.now(),
      });
    }

    // Reset fields for convenient continuous input
    setTitle('');
    setSelectedPreset('');
    setAmount('');
    setNote('');
    setShowNoteInput(false);
  };

  const presets = txType === 'expense' ? EXPENSE_PRESETS : INCOME_PRESETS;

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        isDarkMode
          ? 'glass-card-dark text-white'
          : 'glass-card-light text-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              txType === 'income'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {txType === 'income' ? (
              <Wallet className="w-4 h-4" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              บันทึกรายการด่วน (เพิ่มในหน้าเดียว)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              เลือกจากดรอปดาวน์ หรือพิมพ์ชื่อเองได้อิสระ
            </p>
          </div>
        </div>

        {/* Segmented Toggle: เงินเข้า vs รายจ่าย */}
        <div
          className={`p-1 rounded-2xl border flex items-center gap-1 self-start sm:self-auto ${
            isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setTxType('income');
              setSelectedPreset('');
              setTitle('');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              txType === 'income'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>+ เงินเข้า</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTxType('expense');
              setSelectedPreset('');
              setTitle('');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              txType === 'expense'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>- รายจ่าย</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Row 1: Editable Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            ชื่อรายการ <span className="text-rose-500">*</span>{' '}
            <span className="text-[11px] font-normal text-slate-400">
              (พิมพ์ชื่อเอง หรือกดเลือกด่วนด้านล่าง)
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Dropdown Select */}
            <div className="relative">
              <select
                value={selectedPreset}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPreset(val);
                  if (val) {
                    setTitle(val);
                    if (txType === 'expense') {
                      const found = EXPENSE_PRESETS.find((p) => p.title === val);
                      if (found) setExpenseCategory(found.category);
                    } else {
                      const found = INCOME_PRESETS.find((p) => p.title === val);
                      if (found) setIncomeCategory(found.category);
                    }
                  }
                }}
                className={`w-full py-2.5 px-3 pr-8 rounded-2xl border text-xs font-medium appearance-none outline-none transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900/80 border-white/10 text-slate-200 focus:border-pink-500'
                    : 'bg-white border-slate-200 text-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10'
                }`}
              >
                <option value="">-- เลือกจากดรอปดาวน์ หรือพิมพ์เอง --</option>
                {presets.map((p) => (
                  <option key={p.title} value={p.title}>
                    {p.icon} {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Editable Title Input */}
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                txType === 'expense'
                  ? 'พิมพ์ชื่อรายการ หรือเลือกจากดรอปดาวน์...'
                  : 'พิมพ์ชื่อรายการ หรือเลือกจากดรอปดาวน์...'
              }
              className={`w-full py-2.5 px-3.5 rounded-2xl border text-xs font-medium outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500 focus:border-pink-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10'
              }`}
            />
          </div>
        </div>

        {/* Row 2: Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              จำนวนเงิน (บาท) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="any"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`w-full py-2.5 pl-8 pr-3 rounded-2xl border text-sm font-bold font-num outline-none transition-all ${
                  isDarkMode
                    ? 'bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
                }`}
              />
            </div>

            {/* Quick Amount Shortcuts */}
            <div className="flex items-center gap-1 mt-1.5">
              {[500, 1000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleAddAmount(v)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border font-num transition-all ${
                    isDarkMode
                      ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  +{v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              วันที่
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode
                    ? 'bg-slate-900/80 border-white/10 text-white focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
                }`}
              />
            </div>

            {/* Expense Paid status toggle */}
            {txType === 'expense' && (
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <span>จ่ายเรียบร้อยแล้ว</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {showNoteInput ? '- ซ่อนหมายเหตุ' : '+ เพิ่มหมายเหตุ'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Optional Note */}
        {showNoteInput && (
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติมสั้นๆ (ถ้ามี)..."
              className={`w-full py-2 px-3 rounded-2xl border text-xs outline-none ${
                isDarkMode
                  ? 'bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
              }`}
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 ${
              txType === 'income'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-600/30'
                : 'bg-gradient-to-r from-pink-700 to-rose-700 hover:from-pink-800 hover:to-rose-800 shadow-pink-700/30'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {txType === 'income' ? 'บันทึกเงินเข้า' : 'บันทึกรายจ่าย'} (
              {amount ? `฿${parseFloat(amount || '0').toLocaleString()}` : 'ระบุยอดเงิน'})
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
