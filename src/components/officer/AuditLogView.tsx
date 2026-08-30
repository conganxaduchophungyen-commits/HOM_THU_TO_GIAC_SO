import React, { useState } from 'react';
import { ShieldCheck, Download, Search, Filter, Lock, Calendar } from 'lucide-react';
import { AuditLog } from '../../types';
import { storageService } from '../../services/storageService';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const performedBy = log.performedByName || log.userName || 'Hệ thống';
    const matchesSearch =
      !searchTerm ||
      performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((log.targetId || log.entityId) && (log.targetId || log.entityId || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  const handleExportCsv = () => {
    const csvContent = storageService.exportAuditLogsCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AuditLog_CAX_DucHop_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-900" />
            <span>NHẬT KÝ KIỂM TOÁN AN NINH (AUDIT LOG)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi vết bất biến mọi thao tác nghiệp vụ, đăng nhập, phân công và thay đổi trạng thái hồ sơ.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Xuất báo cáo kiểm toán (.CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo cán bộ, hành động, mã hồ sơ..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
          >
            <option value="ALL">Tất cả hành động ({logs.length})</option>
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <th className="p-3">Thời gian</th>
                <th className="p-3">Hành động</th>
                <th className="p-3">Cán bộ thực hiện</th>
                <th className="p-3">Đối tượng</th>
                <th className="p-3">Chi tiết & Ghi chú nghiệp vụ</th>
                <th className="p-3">Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {filteredLogs.map((log, idx) => (
                <tr key={`${log.logId}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('DELETE')
                          ? 'bg-red-100 text-red-800'
                          : log.action.includes('STATUS') || log.action.includes('ASSIGN')
                          ? 'bg-amber-100 text-amber-800'
                          : log.action.includes('SUBMIT')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3 font-sans font-bold text-slate-900">
                    {log.performedByName || log.userName || 'Hệ thống'}
                  </td>

                  <td className="p-3 text-red-950 font-bold">
                    {log.targetId || log.entityId || '-'}
                  </td>

                  <td className="p-3 font-sans text-slate-700 max-w-md">
                    {log.details}
                  </td>

                  <td className="p-3 text-slate-400 text-[10px]">
                    {log.ipAddress || log.ipOrSession || '127.0.0.1'}
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
