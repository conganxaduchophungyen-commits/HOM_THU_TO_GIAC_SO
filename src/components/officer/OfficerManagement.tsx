import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Phone,
  Mail,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { OfficerUser, UserRole } from '../../types';
import { DUC_HOP_VILLAGES } from '../../constants/policeData';
import { storageService } from '../../services/storageService';

interface OfficerManagementProps {
  currentUser: OfficerUser;
  officers: OfficerUser[];
  onRefresh: () => void;
}

export const OfficerManagement: React.FC<OfficerManagementProps> = ({
  currentUser,
  officers,
  onRefresh,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [rank, setRank] = useState('Đại úy');
  const [position, setPosition] = useState('Cán bộ Công an xã');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [assignedVillages, setAssignedVillages] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canManage =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'CHIEF' ||
    currentUser.role === 'DEPUTY_CHIEF';

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !badgeNumber.trim()) {
      setErrorMsg('Vui lòng nhập Họ tên và Số hiệu CAND.');
      return;
    }

    try {
      storageService.createOfficer({
        fullName: fullName.trim(),
        badgeNumber: badgeNumber.trim(),
        rank,
        position,
        phone: phone.trim(),
        email: email.trim(),
        role,
        assignedVillages: assignedVillages.length > 0 ? assignedVillages : ['Đức An'],
      });

      setIsAdding(false);
      setFullName('');
      setBadgeNumber('');
      setPhone('');
      setEmail('');
      setAssignedVillages([]);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi tạo tài khoản');
    }
  };

  const handleResetPassword = (userId: string, username: string) => {
    if (confirm(`Đặt lại mật khẩu mặc định ("1") cho cán bộ [${username}]? Cán bộ sẽ bắt buộc phải đổi mật khẩu ở lần đăng nhập tiếp theo.`)) {
      storageService.resetOfficerPassword(userId);
      alert(`Đã đặt lại mật khẩu của ${username} về mặc định "1".`);
      onRefresh();
    }
  };

  const handleDelete = (userId: string, username: string) => {
    if (confirm(`Xóa tài khoản cán bộ [${username}]? Hành động này không thể hoàn tác.`)) {
      storageService.deleteOfficer(userId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-900" />
            <span>QUẢN LÝ TÀI KHOẢN CÁN BỘ CÔNG AN XÃ ĐỨC HỢP</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách Ban Chỉ huy và cán bộ chiến sĩ có thẩm quyền truy cập hệ thống.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Thêm tài khoản cán bộ mới</span>
          </button>
        )}
      </div>

      {/* Add Officer Modal / Drawer */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-red-950 to-red-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm">THÊM MỚI CÁN BỘ CÔNG AN</h4>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 text-slate-300 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 font-semibold">{errorMsg}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Họ và tên <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Cán"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Số hiệu CAND (6 số) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="VD: 343009"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Cấp bậc</label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Thượng tá">Thượng tá</option>
                    <option value="Trung tá">Trung tá</option>
                    <option value="Thiếu tá">Thiếu tá</option>
                    <option value="Đại úy">Đại úy</option>
                    <option value="Thượng úy">Thượng úy</option>
                    <option value="Trung úy">Trung úy</option>
                    <option value="Thiếu úy">Thiếu úy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Chức vụ</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="VD: Cán bộ CSKV / CSTT"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0988.xxx.xxx"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Vai trò phân quyền</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="OFFICER">Cán bộ xử lý (OFFICER)</option>
                    <option value="DUTY_OFFICER">Cán bộ Trực ban (DUTY_OFFICER)</option>
                    <option value="DEPUTY_CHIEF">Phó trưởng CAX (DEPUTY_CHIEF)</option>
                    <option value="CHIEF">Trưởng CAX (CHIEF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Thôn phụ trách (trong 11 Thôn)</label>
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 max-h-28 overflow-y-auto">
                  {DUC_HOP_VILLAGES.map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedVillages.includes(v)}
                        onChange={(e) => {
                          if (e.target.checked) setAssignedVillages((p) => [...p, v]);
                          else setAssignedVillages((p) => p.filter((x) => x !== v));
                        }}
                        className="rounded text-red-900"
                      />
                      <span>Thôn {v}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-[11px]">
                * Tên tài khoản tự động sinh theo cấu trúc: <code>[Tên][Số hiệu]</code>. Mật khẩu khởi tạo là <strong>1</strong> (Bắt buộc đổi pass ở lần đầu đăng nhập).
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold"
                >
                  Tạo tài khoản cán bộ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Officers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Cán bộ chiến sĩ</th>
                <th className="p-3.5">Tài khoản & Số hiệu</th>
                <th className="p-3.5">Cấp bậc / Chức vụ</th>
                <th className="p-3.5">Quyền hạn</th>
                <th className="p-3.5">Địa bàn phụ trách</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {officers.map((officer) => (
                <tr key={officer.userId} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{officer.fullName}</div>
                    <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" /> {officer.phone || 'Chưa cập nhật'}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-mono font-bold text-red-950 px-2 py-0.5 rounded bg-red-50 border border-red-200">
                      {officer.username}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      SH: {officer.badgeNumber}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="font-semibold text-slate-800">{officer.rank}</span>
                    <span className="text-slate-500 block text-[11px]">{officer.position}</span>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        officer.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : officer.role === 'CHIEF'
                          ? 'bg-red-100 text-red-800'
                          : officer.role === 'DEPUTY_CHIEF'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {officer.role}
                    </span>
                    {officer.mustChangePassword && (
                      <span className="block text-[9px] text-amber-600 font-bold mt-0.5">
                        * Cần đổi pass
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <div className="max-w-[180px] text-[11px] text-slate-600 truncate">
                      {officer.assignedVillages?.join(', ') || 'Chưa gán'}
                    </div>
                  </td>

                  <td className="p-3.5 text-right space-x-1">
                    {canManage && officer.role !== 'SUPER_ADMIN' && (
                      <>
                        <button
                          onClick={() => handleResetPassword(officer.userId, officer.username)}
                          title="Đặt lại mật khẩu mặc định (1)"
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(officer.userId, officer.username)}
                          title="Xóa cán bộ"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
