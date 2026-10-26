import React, { useState } from 'react';
import { X, Triangle, CheckCircle, ExternalLink, Sparkles, Copy, Globe, Terminal, Download } from 'lucide-react';

interface VercelConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const VercelConnectModal: React.FC<VercelConnectModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = false,
}) => {
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const envVariablesText = `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bWJhc3VjaXFmZ3hhamFsaHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5OTM5NzUsImV4cCI6MjEwODU2OTk3NX0.jPRTjfU1LscTq6gb5DMTeaEnbtS39nAzAdVuKqYwJIY
VITE_SUPABASE_URL=https://azmbasuciqfgxajalhxn.supabase.co`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envVariablesText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
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
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold shadow-md shadow-black/30 border border-white/20">
            <Triangle className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>ดาวน์โหลด & Deploy ขึ้น Vercel</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                ZIP Ready
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ดาวน์โหลดไฟล์โปรเจกต์ ZIP หรือนำไปลากวางอัปโหลดขึ้น Vercel ได้ทันที
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Direct ZIP Download Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/15 to-rose-500/15 border border-pink-500/30 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                📦 ไฟล์โค้ดโปรเจกต์ (monny-app.zip)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                ดาวน์โหลดเพื่อนำไปแตกไฟล์ ลากวางใส่ GitHub หรือลากใส่ Vercel
              </p>
            </div>
            <a
              href="/monny-app.zip"
              download="monny-app.zip"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-pink-600/30 shrink-0 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด ZIP</span>
            </a>
          </div>

          {/* Step 1 */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1.5 text-xs">
              <Globe className="w-4 h-4 text-pink-500" />
              <span>วิธีอัปโหลดไฟล์ขึ้น GitHub (วิธีที่ง่ายที่สุด):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>กดปุ่ม <b>"ดาวน์โหลด ZIP"</b> ด้านบน และแตกไฟล์ (Unzip) ในเครื่องคอมพิวเตอร์ของคุณ</li>
              <li>เปิดลิงก์ GitHub ของคุณ: <a href="https://github.com/sakchai620/Monny" target="_blank" rel="noreferrer" className="text-pink-600 font-bold underline">github.com/sakchai620/Monny</a></li>
              <li>กดปุ่ม <b>Add file</b> ➔ <b>Upload files</b> แล้วลากไฟล์ทั้งหมดในโฟลเดอร์มาวาง</li>
              <li>กดปุ่มสีเขียว <b>Commit changes</b></li>
              <li>กลับไปที่ Vercel แล้วกดปุ่ม <b>Deploy</b> ได้ทันทีครับ!</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span> Environment Variables ใน Vercel</span>
              </h4>
              <button
                onClick={handleCopyEnv}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-all"
              >
                {copiedEnv ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEnv ? 'คัดลอกแล้ว!' : 'คัดลอกค่า Env'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap select-all border border-slate-700">
              {envVariablesText}
            </pre>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
            >
              รับทราบ / ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
