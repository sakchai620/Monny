import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { LogIn, LogOut, Database, CheckCircle2, Server, Triangle } from 'lucide-react';
import { SupabaseConnectModal } from './SupabaseConnectModal.tsx';
import { VercelConnectModal } from './VercelConnectModal.tsx';
import { getSupabaseAnonKey } from '../lib/supabase.ts';

interface AuthBarProps {
  user: User | null;
  isDarkMode?: boolean;
}

export const AuthBar: React.FC<AuthBarProps> = ({ user, isDarkMode = false }) => {
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [hasSupabaseKey, setHasSupabaseKey] = useState(false);

  useEffect(() => {
    setHasSupabaseKey(!!getSupabaseAnonKey());
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <div
        className={`w-full py-2.5 px-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-2.5 text-xs ${
          isDarkMode
            ? 'bg-slate-900/80 border-pink-500/20 text-slate-200'
            : 'bg-white/90 border-pink-200 text-slate-700 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 font-bold">
            <Database className="w-4 h-4" />
          </div>

          {user ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-slate-800 dark:text-white truncate max-w-[140px] sm:max-w-none">
                {user.displayName || user.email}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Cloud SQL & Supabase
              </span>
            </div>
          ) : (
            <div>
              <span className="font-semibold text-slate-800 dark:text-white block sm:inline">
                ฐานข้อมูล PostgreSQL (Cloud SQL & Supabase)
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline ml-1.5">
                ซิงค์ข้อมูลเรียบร้อยแล้ว
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Supabase connection button */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
              hasSupabaseKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50'
            }`}
            title="ตั้งค่า Supabase API Key"
          >
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            <span>{hasSupabaseKey ? 'Supabase' : 'ใส่ Supabase Key'}</span>
          </button>

          {/* Vercel Deploy Button */}
          <button
            onClick={() => setIsVercelModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-black text-white hover:bg-slate-900 transition-all text-xs font-semibold shadow-xs"
            title="วิธี Deploy ขึ้น Vercel"
          >
            <Triangle className="w-3.5 h-3.5 fill-current" />
            <span>Vercel Deploy</span>
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold transition-all text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold shadow-md shadow-pink-600/25 transition-all text-xs active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ Google</span>
            </button>
          )}
        </div>
      </div>

      <SupabaseConnectModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onKeySaved={() => setHasSupabaseKey(!!getSupabaseAnonKey())}
        isDarkMode={isDarkMode}
      />

      <VercelConnectModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
};
