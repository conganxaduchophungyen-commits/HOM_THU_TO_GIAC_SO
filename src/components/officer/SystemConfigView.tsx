import React, { useState } from 'react';
import { Settings, Save, Mail, Clock, Database, Download, Upload, CheckCircle2, Shield } from 'lucide-react';
import { CaseCategory } from '../../types';
import { CATEGORY_DETAILS, DUC_HOP_COMMUNE_INFO } from '../../constants/policeData';
import { storageService } from '../../services/storageService';

interface SystemConfigViewProps {
  onRefresh: () => void;
}

export const SystemConfigView: React.FC<SystemConfigViewProps> = ({ onRefresh }) => {
  const currentConfig = storageService.getConfig();
  const [notificationEmail, setNotificationEmail] = useState(
    currentConfig.emergencyNotificationEmail || 'conganxaduchopdangbai@gmail.com'
  );
  const [deadlineDays, setDeadlineDays] = useState<Record<CaseCategory, number>>(
    currentConfig.defaultDeadlineDays
  );
  const [autoEmailNotify, setAutoEmailNotify] = useState(currentConfig.autoEmailNotification);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveConfig({
      ...currentConfig,
      emailNotification: notificationEmail.trim(),
      emergencyNotificationEmail: notificationEmail.trim(),
      defaultDeadlineDays: deadlineDays,
      autoEmailNotification: autoEmailNotify,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_DB_CAX_DucHop_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const res = storageService.importDatabaseJson(jsonStr);
        if (res.success) {
          alert('Phục hồi dữ liệu hệ thống thành công!');
          onRefresh();
        } else {
          alert('Lỗi phục hồi dữ liệu: ' + res.message);
        }
      } catch (err: any) {
        alert('File không hợp lệ: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-900" />
            <span>CẤU HÌNH HỆ THỐNG & SAO LƯU DỮ LIỆU</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập thời hạn giải quyết theo từng danh mục và sao lưu cơ sở dữ liệu.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Đã lưu thành công cấu hình hệ thống nghiệp vụ!</span>
        </div>
      )}

      {/* Config Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Email & Notification Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-extrabold text-slate-900 uppercase text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-blue-700" />
            <span>THIẾT LẬP THÔNG BÁO EMAIL TỨC THÌ</span>
          </h4>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Email Trực ban Công an xã tiếp nhận tin báo:
            </label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Mặc định: <strong>conganxaduchopdangbai@gmail.com</strong>
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Tự động gửi email thông báo khi có tin mới</span>
              <span className="text-[11px] text-slate-500">Gửi kèm thông tin vụ việc và cảnh báo khẩn cấp.</span>
            </div>
            <input
              type="checkbox"
              checked={autoEmailNotify}
              onChange={(e) => setAutoEmailNotify(e.target.checked)}
              className="w-5 h-5 rounded text-red-900"
            />
          </div>
        </div>

        {/* Default Deadlines per Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-extrabold text-slate-900 uppercase text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-red-700" />
            <span>THỜI HẠN GIẢI QUYẾT THEO DANH MỤC (SỐ NGÀY)</span>
          </h4>

          <div className="space-y-2.5">
            {(Object.keys(CATEGORY_DETAILS) as CaseCategory[]).map((cat) => (
              <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">{CATEGORY_DETAILS[cat].label}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={deadlineDays[cat] || 7}
                    onChange={(e) =>
                      setDeadlineDays({
                        ...deadlineDays,
                        [cat]: parseInt(e.target.value) || 7,
                      })
                    }
                    className="w-16 px-2 py-1 text-center font-bold font-mono rounded border border-slate-300 bg-white"
                  />
                  <span className="text-slate-500 text-[11px]">ngày</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>LƯU CẤU HÌNH</span>
            </button>
          </div>
        </div>
      </form>

      {/* Database Backup & Restore */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h4 className="font-extrabold text-slate-900 uppercase text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Database className="w-4 h-4 text-emerald-700" />
          <span>SAO LƯU & PHỤC HỒI TOÀN BỘ CƠ SỞ DỮ LIỆU</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Sao lưu dữ liệu (Export JSON)</span>
            <p className="text-[11px] text-slate-600">
              Tải về toàn bộ hồ sơ, tài khoản cán bộ, audit log và cấu hình hệ thống dưới dạng tệp tin mã hóa JSON.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Tải bản sao lưu JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Phục hồi dữ liệu (Import JSON)</span>
            <p className="text-[11px] text-slate-600">
              Khôi phục lại dữ liệu từ tệp sao lưu JSON đã tải về trước đó.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Chọn file sao lưu để phục hồi</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
