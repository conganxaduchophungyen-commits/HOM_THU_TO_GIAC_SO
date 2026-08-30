import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  AlertCircle,
  LogIn,
  KeyRound,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';
import { OfficerUser } from '../../types';
import { storageService } from '../../services/storageService';
import { DUC_HOP_COMMUNE_INFO } from '../../constants/policeData';

interface OfficerLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: OfficerUser) => void;
}

export const OfficerLogin: React.FC<OfficerLoginProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountsTip, setShowAccountsTip] = useState(true);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = storageService.login(username.trim(), password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message);
      }
    }, 200);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-red-950 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white p-6 text-center border-b border-amber-400/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-800 to-red-950 mx-auto flex items-center justify-center border border-amber-400/60 shadow mb-2">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
            {DUC_HOP_COMMUNE_INFO.unitTitle} • TỈNH HƯNG YÊN
          </div>
          <h3 className="text-base font-extrabold text-white mt-0.5">
            CỔNG ĐĂNG NHẬP CÁN BỘ CÔNG AN
          </h3>
          <p className="text-[11px] text-slate-300 mt-1">
            Hệ thống quản lý, phân loại và thụ lý hồ sơ tố giác tội phạm số
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Tên tài khoản cán bộ <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="input-login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: Quang343001 hoặc admin"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Mật khẩu truy cập <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (Mặc định: 1)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-red-900 hover:bg-red-800 text-white font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>{isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
          </button>

          {/* Preset Test Accounts Shortcut */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                Tài khoản kiểm thử nhanh:
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin@123')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-left border border-slate-200 transition-colors"
              >
                <div className="font-bold text-red-950">Super Admin</div>
                <div className="text-slate-500 font-mono">admin / admin@123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Quang343001', '1')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-left border border-slate-200 transition-colors"
              >
                <div className="font-bold text-red-950">Thượng tá Quang</div>
                <div className="text-slate-500 font-mono">Quang343001 / 1</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Hai343002', '1')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-left border border-slate-200 transition-colors"
              >
                <div className="font-bold text-red-950">Thiếu tá Hài</div>
                <div className="text-slate-500 font-mono">Hai343002 / 1</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Doanh343005', '1')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-left border border-slate-200 transition-colors"
              >
                <div className="font-bold text-red-950">Đ/c Doanh (Cán bộ)</div>
                <div className="text-slate-500 font-mono">Doanh343005 / 1</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-2 text-center">
              * Mật khẩu mặc định cho cán bộ là <strong>1</strong> (Hệ thống sẽ yêu cầu đổi pass ở lần đăng nhập đầu).
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
