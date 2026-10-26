import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, Database, Copy, ExternalLink, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      setAnonKey(getSupabaseAnonKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all relative ${
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">เชื่อมต่อ Supabase Project</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              โครงการ Monny (<span className="font-mono text-emerald-600 dark:text-emerald-400">azmbasuciqfgxajalhxn</span>)
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>วิธีเอา API Key มาใส่ (ใช้เวลา 10 วินาที):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <li>
                ในหน้า Supabase Dashboard คลิกปุ่ม <b>"API Keys"</b> (มุมขวาล่าง) หรือไอคอน <b>⚙️ Settings -&gt; API</b>
              </li>
              <li>
                คัดลอกคีย์ตรงช่อง <b><span className="font-mono bg-emerald-100 dark:bg-emerald-950/80 px-1 py-0.5 rounded text-emerald-700 dark:text-emerald-300">anon</span> <span className="font-mono text-[10px] text-slate-500">(Public API Key)</span></b>
              </li>
              <li>นำมาวางในช่องด้านล่างนี้ได้เลยครับ</li>
            </ol>
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
