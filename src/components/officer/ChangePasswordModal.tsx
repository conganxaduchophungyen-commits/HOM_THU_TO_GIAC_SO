import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { OfficerUser } from '../../types';
import { storageService } from '../../services/storageService';

interface ChangePasswordModalProps {
  user: OfficerUser;
  isOpen: boolean;
  onSuccess: (updatedUser: OfficerUser) => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  isOpen,
  onSuccess,
  onClose,
  isMandatory = false,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!oldPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword === '1' || newPassword === '123456') {
      setErrorMsg('Mật khẩu quá đơn giản. Vui lòng chọn mật khẩu bảo mật hơn.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setIsLoading(true);
    const res = storageService.changePassword(user.userId, oldPassword, newPassword);
    setIsLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-red-900 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 text-white p-5 flex items-center justify-between border-b border-amber-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center border border-amber-400/40">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                BẢO MẬT TÀI KHOẢN NGHIỆP VỤ
              </div>
              <h3 className="text-base font-extrabold text-white">
                {isMandatory ? 'BẮT BUỘC ĐỔI MẬT KHẨU LẦN ĐẦU' : 'ĐỔI MẬT KHẨU TÀI KHOẢN'}
              </h3>
            </div>
          </div>
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {isMandatory && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                Đây là lần đăng nhập đầu tiên của đồng chí <strong>{user.fullName}</strong>. Vì lý do an toàn thông tin theo quy định, đồng chí bắt buộc phải thay đổi mật khẩu mặc định trước khi tiếp tục.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Mật khẩu hiện tại (hoặc mặc định '1') <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Mật khẩu mới (Tối thiểu 6 ký tự) <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới an toàn"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Nhập lại mật khẩu mới <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-red-900 hover:bg-red-800 text-white font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isLoading ? 'Đang cập nhật mật khẩu...' : 'LƯU MẬT KHẨU MỚI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
