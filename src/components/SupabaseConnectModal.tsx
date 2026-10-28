import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, Database, Copy, ExternalLink, Sparkles, Terminal } from 'lucide-react';
import { SUPABASE_URL, getSupabaseAnonKey } from '../lib/supabase.ts';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
  isDarkMode?: boolean;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  isDarkMode = false,
}) => {
  const [anonKey, setAnonKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlScript = `-- 1. สร้างตารางบันทึกข้อมูลย้อนหลัง (transactions)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  date TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  due_date TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ปิด RLS เพื่อให้เว็บแอปบันทึกข้อมูลได้ทันทีโดยไม่ถูกบล็อก
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;`;

  useEffect(() => {
    if (isOpen) {
      setAnonKey(getSupabaseAnonKey());
      setSavedSuccess(false);
      setCopiedSql(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase_anon_key', anonKey.trim());
    }
    onKeySaved(anonKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl transition-all relative max-h-[90vh] overflow-y-auto ${
          isDarkMode
            ? 'bg-slate-900/95 border-pink-500/30 text-white shadow-pink-900/20'
            : 'bg-white/95 border-pink-200 text-slate-800 shadow-pink-500/10'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">เชื่อมต่อ & ตั้งค่า Supabase Project</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              โครงการ Monny (<span className="font-mono text-emerald-600 dark:text-emerald-400">azmbasuciqfgxajalhxn</span>)
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* SQL Setup Instruction */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>คำสั่งสร้างตารางใน Supabase (สำคัญมาก):</span>
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-500/30 transition-all"
              >
                {copiedSql ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'คัดลอก SQL แล้ว!' : 'คัดลอก SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
              หากบันทึกข้อมูลแล้วไม่ขึ้น ให้ไปที่ Supabase ➔ <b>SQL Editor</b> ➔ วางคำสั่งด้านล่างนี้แล้วกด <b>Run</b>:
            </p>
            <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap select-all border border-slate-700">
              {sqlScript}
            </pre>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Supabase URL
            </label>
            <input
              type="text"
              readOnly
              value={SUPABASE_URL}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-600 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Supabase Anon Key (Public API Key)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs transition-all"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>บันทึก Supabase Key เรียบร้อยแล้ว!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>บันทึกการเชื่อมต่อ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

