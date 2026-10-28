import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  CreditCard,
  Wallet,
  ChevronDown,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  MajorExpenseCategory,
  IncomeCategory,
} from '../types/finance';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
  defaultType?: TransactionType;
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

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultType = 'major_expense',
}) => {
  const [activeType, setActiveType] = useState<'income' | 'major_expense'>('major_expense');
  const [title, setTitle] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState(true);
  const [majorCategory, setMajorCategory] = useState<MajorExpenseCategory>('car_installment');
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('salary');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (defaultType === 'income') {
      setActiveType('income');
    } else {
      setActiveType('major_expense');
    }
  }, [defaultType, isOpen]);

  if (!isOpen) return null;

  const handleDropdownSelect = (value: string) => {
    setSelectedPreset(value);
    if (!value) return;

    if (activeType === 'major_expense') {
      const found = EXPENSE_PRESETS.find((p) => p.title === value);
      if (found) {
        setTitle(found.title);
        setMajorCategory(found.category);
      }
    } else {
      const found = INCOME_PRESETS.find((p) => p.title === value);
      if (found) {
        setTitle(found.title);
        setIncomeCategory(found.category);
      }
    }
  };

  const handleChipClick = (presetTitle: string, category: any) => {
    setTitle(presetTitle);
    setSelectedPreset(presetTitle);
    if (activeType === 'major_expense') {
      setMajorCategory(category);
    } else {
      setIncomeCategory(category);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (!title.trim() || numAmount <= 0) return;

    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (activeType === 'major_expense') {
      onAdd({
        id,
        type: 'major_expense',
        title: title.trim(),
        amount: numAmount,
        category: majorCategory,
        date,
        isPaid,
        dueDate: date,
        note: note.trim() || undefined,
        createdAt: Date.now(),
      });
    } else {
      onAdd({
        id,
        type: 'income',
        title: title.trim(),
        amount: numAmount,
        category: incomeCategory,
        date,
        note: note.trim() || undefined,
        createdAt: Date.now(),
      });
    }

    onClose();
  };

  const presets = activeType === 'major_expense' ? EXPENSE_PRESETS : INCOME_PRESETS;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden transition-all max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${
                activeType === 'income'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {activeType === 'income' ? (
                <Wallet className="w-5 h-5" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                บันทึกรายการทางการเงิน
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Type Selector (Only 2 modes: เงินเข้า vs รายจ่าย) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              เลือกประเภทรายการ:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setActiveType('income');
                  setSelectedPreset('');
                  setTitle('');
                }}
                className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeType === 'income'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>💵 เงินเข้า / รายรับ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveType('major_expense');
                  setSelectedPreset('');
                  setTitle('');
                }}
                className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeType === 'major_expense'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>💳 ค่าใช้จ่าย / รายจ่าย</span>
              </button>
            </div>
          </div>

          {/* Item Name: Dropdown + Editable Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              ชื่อรายการ <span className="text-rose-500">*</span>
            </label>

            {/* Dropdown Preset */}
            <div className="relative">
              <select
                value={selectedPreset}
                onChange={(e) => handleDropdownSelect(e.target.value)}
                className="w-full py-2.5 px-3 pr-8 rounded-2xl border text-xs font-medium appearance-none outline-none transition-all cursor-pointer bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:border-indigo-500"
              >
                <option value="">-- เลือกรายการด่วนจากดรอปดาวน์ --</option>
                {presets.map((p) => (
                  <option key={p.title} value={p.title}>
                    {p.icon} {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Free Text Input */}
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeType === 'major_expense'
                  ? 'หรือพิมพ์ชื่อเอง เช่น งวดรถ, ค่าไฟ, ซ่อมรถ...'
                  : 'หรือพิมพ์ชื่อเอง เช่น เงินเดือน, โบนัส, ขายของ...'
              }
              className="w-full py-2.5 px-3.5 rounded-2xl border text-xs font-medium outline-none transition-all bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">เลือกด่วน:</span>
              {presets.slice(0, 5).map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => handleChipClick(p.title, p.category)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                    title === p.title
                      ? activeType === 'income'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {p.icon} {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
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
                  className="w-full py-2.5 pl-8 pr-3 rounded-2xl border text-sm font-bold font-num outline-none transition-all bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                วันที่
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl border text-xs font-medium outline-none transition-all bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Expense isPaid option */}
          {activeType === 'major_expense' && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  สถานะการจ่าย
                </span>
                <span className="text-[11px] text-slate-400">
                  {isPaid ? 'จ่ายเงินแล้ว (จะนำไปหักลบในระบบ)' : 'ยังไม่จ่าย (รอครบกำหนด)'}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span>จ่ายแล้ว</span>
              </label>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              บันทึกเพิ่มเติม (Note)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="หมายเหตุสั้นๆ..."
              className="w-full py-2.5 px-3.5 rounded-2xl border text-xs outline-none bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-2xl font-bold text-xs text-white shadow-md transition-all ${
                activeType === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
