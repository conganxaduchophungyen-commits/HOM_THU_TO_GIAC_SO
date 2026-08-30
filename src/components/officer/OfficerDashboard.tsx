import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  Settings,
  ShieldAlert,
  BarChart3,
  Calendar,
  MapPin,
  Flame,
  FileText,
  UserCheck,
  Code,
  KeyRound,
  Download,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import { OfficerUser, CaseRecord, CaseStatus, CaseCategory, PriorityLevel } from '../../types';
import {
  STATUS_DETAILS,
  CATEGORY_DETAILS,
  PRIORITY_DETAILS,
  DUC_HOP_VILLAGES,
  DUC_HOP_COMMUNE_INFO,
} from '../../constants/policeData';
import { storageService } from '../../services/storageService';
import { CaseDetailModal } from './CaseDetailModal';
import { OfficerManagement } from './OfficerManagement';
import { AuditLogView } from './AuditLogView';
import { SystemConfigView } from './SystemConfigView';
import { GasDeploymentCenter } from './GasDeploymentCenter';
import { ChangePasswordModal } from './ChangePasswordModal';

interface OfficerDashboardProps {
  currentUser: OfficerUser;
  onLogout: () => void;
  onUpdateCurrentUser: (user: OfficerUser) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  currentUser,
  onLogout,
  onUpdateCurrentUser,
}) => {
  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<
    'cases' | 'officers' | 'audit' | 'config' | 'gas_center'
  >('cases');

  // Modal States
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(
    currentUser.mustChangePassword
  );

  // Filters State
  const [filterVillage, setFilterVillage] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterAssigned, setFilterAssigned] = useState<string>('ALL');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Data State
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const allCases = storageService.getAllCases();
  const allOfficers = storageService.getOfficers();
  const allAuditLogs = storageService.getAuditLogs();
  const stats = storageService.getStatistics();

  // Filter cases logic
  const filteredCases = allCases.filter((c) => {
    const matchesVillage = filterVillage === 'ALL' || c.village === filterVillage;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
    const matchesAssigned =
      filterAssigned === 'ALL' ||
      (filterAssigned === 'UNASSIGNED' &&
        (!c.assignedToOfficerIds || c.assignedToOfficerIds.length === 0)) ||
      (c.assignedToOfficerIds && c.assignedToOfficerIds.includes(filterAssigned));
    const isOverdue =
      c.deadline &&
      new Date(c.deadline).getTime() < Date.now() &&
      c.status !== 'RESOLVED' &&
      c.status !== 'ARCHIVED' &&
      c.status !== 'REJECTED';
    const matchesOverdue = !filterOverdueOnly || isOverdue;

    const matchesSearch =
      !searchKeyword ||
      c.caseId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.publicTrackingCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (c.incidentLocation && c.incidentLocation.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (c.reporterName && c.reporterName.toLowerCase().includes(searchKeyword.toLowerCase()));

    return (
      matchesVillage &&
      matchesStatus &&
      matchesCategory &&
      matchesPriority &&
      matchesAssigned &&
      matchesOverdue &&
      matchesSearch
    );
  });

  const canManageOfficers =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'CHIEF' ||
    currentUser.role === 'DEPUTY_CHIEF';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Officer Header Card */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white rounded-2xl p-6 border border-amber-400/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-2xl bg-amber-400 text-red-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-white/30">
              ★
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>{DUC_HOP_COMMUNE_INFO.unitTitle}</span>
                <span>•</span>
                <span>{currentUser.role}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5">
                {currentUser.rank} {currentUser.fullName}
              </h2>
              <div className="text-xs text-red-200/90 flex flex-wrap items-center gap-3 mt-1">
                <span>Chức vụ: <strong>{currentUser.position}</strong></span>
                <span>•</span>
                <span>Số hiệu: <strong className="font-mono">{currentUser.badgeNumber}</strong></span>
                <span>•</span>
                <span>Tài khoản: <strong className="font-mono">{currentUser.username}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-400/30 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đổi mật khẩu</span>
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center gap-1.5 pt-6 mt-6 border-t border-white/10 overflow-x-auto text-xs font-bold">
          <button
            id="subtab-cases"
            onClick={() => setActiveSubTab('cases')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all ${
              activeSubTab === 'cases'
                ? 'bg-amber-400 text-red-950 shadow-md font-extrabold'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Hồ sơ nghiệp vụ ({allCases.length})</span>
          </button>

          {canManageOfficers && (
            <button
              id="subtab-officers"
              onClick={() => setActiveSubTab('officers')}
              className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all ${
                activeSubTab === 'officers'
                  ? 'bg-amber-400 text-red-950 shadow-md font-extrabold'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Cán bộ CAX ({allOfficers.length})</span>
            </button>
          )}

          <button
            id="subtab-audit"
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all ${
              activeSubTab === 'audit'
                ? 'bg-amber-400 text-red-950 shadow-md font-extrabold'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Log An ninh</span>
          </button>

          {canManageOfficers && (
            <button
              id="subtab-config"
              onClick={() => setActiveSubTab('config')}
              className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all ${
                activeSubTab === 'config'
                  ? 'bg-amber-400 text-red-950 shadow-md font-extrabold'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cấu hình & Sao lưu</span>
            </button>
          )}

          <button
            id="subtab-gas"
            onClick={() => setActiveSubTab('gas_center')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all ${
              activeSubTab === 'gas_center'
                ? 'bg-amber-400 text-red-950 shadow-md font-extrabold'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Mã nguồn GAS & Test</span>
          </button>
        </div>
      </div>

      {/* ----------------- SUB-TAB: CASES ----------------- */}
      {activeSubTab === 'cases' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase">TỔNG HỒ SƠ</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-slate-400">Tiếp nhận toàn xã</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-blue-700 uppercase">TIẾP NHẬN HÔM NAY</span>
              <div className="text-2xl font-black text-blue-900 mt-0.5">{stats.today}</div>
              <span className="text-[10px] text-blue-600 font-medium">Trong ngày 24h</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 uppercase">ĐANG XÁC MINH</span>
              <div className="text-2xl font-black text-amber-900 mt-0.5">{stats.processing}</div>
              <span className="text-[10px] text-amber-600 font-medium">Đang thụ lý</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">ĐÃ GIẢI QUYẾT</span>
              <div className="text-2xl font-black text-emerald-900 mt-0.5">{stats.resolved}</div>
              <span className="text-[10px] text-emerald-600 font-medium">Hoàn tất xử lý</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-red-700 uppercase">QUÁ HẠN / GẤP</span>
              <div className="text-2xl font-black text-red-900 mt-0.5">{stats.overdue}</div>
              <span className="text-[10px] text-red-600 font-medium">Cần đôn đốc</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-purple-700 uppercase">CHƯA PHÂN CÔNG</span>
              <div className="text-2xl font-black text-purple-900 mt-0.5">{stats.unassigned}</div>
              <span className="text-[10px] text-purple-600 font-medium">Chờ BCH duyệt</span>
            </div>
          </div>

          {/* Chart by 11 Villages */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-red-900" />
                <span>PHÂN BỐ TIN TỐ GIÁC / PHẢN ÁNH THEO 11 THÔN XÃ ĐỨC HỢP</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2 pt-2">
              {DUC_HOP_VILLAGES.map((v) => {
                const count = stats.byVillage[v] || 0;
                const countsArray = Object.values(stats.byVillage) as number[];
                const maxCount = Math.max(...countsArray, 1);
                const heightPercent = Math.max((count / maxCount) * 100, 15);

                return (
                  <div
                    key={v}
                    onClick={() => setFilterVillage(v)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-between cursor-pointer transition-all ${
                      filterVillage === v
                        ? 'border-red-800 bg-red-50 ring-1 ring-red-800'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                    }`}
                  >
                    <div className="h-14 w-full flex items-end justify-center pb-1">
                      <div
                        className={`w-4 rounded-t transition-all ${
                          count > 0 ? 'bg-red-800' : 'bg-slate-200'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-slate-900">{count}</span>
                    <span className="text-[10px] text-slate-600 font-medium truncate w-full text-center mt-1">
                      {v}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comprehensive Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-red-900" />
                <span>BỘ LỌC TÌM KIẾM HỒ SƠ ĐA TIÊU CHÍ</span>
              </span>
              <button
                onClick={() => {
                  setFilterVillage('ALL');
                  setFilterStatus('ALL');
                  setFilterCategory('ALL');
                  setFilterPriority('ALL');
                  setFilterAssigned('ALL');
                  setFilterOverdueOnly(false);
                  setSearchKeyword('');
                }}
                className="text-[11px] font-bold text-red-800 hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search text */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Mã hồ sơ, địa điểm, nội dung..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              {/* Village Filter */}
              <div>
                <select
                  value={filterVillage}
                  onChange={(e) => setFilterVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="ALL">Tất cả 11 Thôn</option>
                  {DUC_HOP_VILLAGES.map((v) => (
                    <option key={v} value={v}>
                      Thôn {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  {Object.entries(STATUS_DETAILS).map(([stKey, stVal]) => (
                    <option key={stKey} value={stKey}>
                      {stVal.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="ALL">Tất cả mức độ</option>
                  {Object.entries(PRIORITY_DETAILS).map(([pKey, pVal]) => (
                    <option key={pKey} value={pKey}>
                      {pVal.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Officer Filter */}
              <div>
                <select
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="ALL">Tất cả cán bộ</option>
                  <option value="UNASSIGNED">Chưa phân công</option>
                  {allOfficers
                    .filter((o) => o.role !== 'SUPER_ADMIN')
                    .map((o) => (
                      <option key={o.userId} value={o.userId}>
                        {o.fullName}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Overdue checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-red-900">
                <input
                  type="checkbox"
                  checked={filterOverdueOnly}
                  onChange={(e) => setFilterOverdueOnly(e.target.checked)}
                  className="rounded text-red-900"
                />
                <span>Chỉ hiển thị hồ sơ quá hạn xử lý</span>
              </label>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 font-medium">
                Tìm thấy <strong>{filteredCases.length}</strong> / {allCases.length} hồ sơ
              </span>
            </div>
          </div>

          {/* Cases Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">Mã hồ sơ / Tiếp nhận</th>
                    <th className="p-3.5">Loại hình / Địa bàn</th>
                    <th className="p-3.5">Nội dung tóm tắt</th>
                    <th className="p-3.5">Mức độ / Trạng thái</th>
                    <th className="p-3.5">Cán bộ thụ lý</th>
                    <th className="p-3.5">Hạn xử lý</th>
                    <th className="p-3.5 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCases.map((c) => {
                    const isOverdue =
                      c.deadline &&
                      new Date(c.deadline).getTime() < Date.now() &&
                      c.status !== 'RESOLVED' &&
                      c.status !== 'ARCHIVED' &&
                      c.status !== 'REJECTED';

                    return (
                      <tr
                        key={c.caseId}
                        onClick={() => setSelectedCase(c)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isOverdue ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-red-950">{c.caseId}</div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">
                            {CATEGORY_DETAILS[c.category]?.label || c.category}
                          </span>
                          <span className="text-[11px] text-red-900 font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-red-600" /> Thôn {c.village}
                          </span>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <div className="line-clamp-2 text-slate-700 leading-snug font-normal">
                            {c.description}
                          </div>
                          {c.attachments && c.attachments.length > 0 && (
                            <span className="text-[10px] text-blue-700 font-bold mt-1 inline-flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {c.attachments.length} tệp đính kèm
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 space-y-1">
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                STATUS_DETAILS[c.status]?.badgeColor
                              }`}
                            >
                              {STATUS_DETAILS[c.status]?.label}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${
                                PRIORITY_DETAILS[c.priority]?.badgeColor
                              }`}
                            >
                              {PRIORITY_DETAILS[c.priority]?.label}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          {c.assignedOfficerNames && c.assignedOfficerNames.length > 0 ? (
                            <div className="font-semibold text-slate-800 text-[11px]">
                              {c.assignedOfficerNames.join(', ')}
                            </div>
                          ) : (
                            <span className="text-[10px] text-purple-700 font-bold px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                              Chưa phân công
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`font-mono text-xs font-bold block ${
                              isOverdue ? 'text-red-700 font-black' : 'text-slate-700'
                            }`}
                          >
                            {c.deadline ? new Date(c.deadline).toLocaleDateString('vi-VN') : '-'}
                          </span>
                          {isOverdue && (
                            <span className="text-[9px] font-extrabold text-red-600 block">
                              QUÁ HẠN!
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCase(c);
                            }}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-900 font-bold transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredCases.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                Không tìm thấy hồ sơ nào phù hợp với bộ lọc đã chọn.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: OFFICERS MANAGEMENT ----------------- */}
      {activeSubTab === 'officers' && canManageOfficers && (
        <OfficerManagement
          currentUser={currentUser}
          officers={allOfficers}
          onRefresh={handleRefresh}
        />
      )}

      {/* ----------------- SUB-TAB: AUDIT LOG ----------------- */}
      {activeSubTab === 'audit' && <AuditLogView logs={allAuditLogs} />}

      {/* ----------------- SUB-TAB: CONFIG & BACKUP ----------------- */}
      {activeSubTab === 'config' && canManageOfficers && (
        <SystemConfigView onRefresh={handleRefresh} />
      )}

      {/* ----------------- SUB-TAB: GAS DEPLOYMENT CENTER ----------------- */}
      {activeSubTab === 'gas_center' && <GasDeploymentCenter />}

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseRecord={selectedCase}
          currentUser={currentUser}
          officersList={allOfficers}
          onClose={() => setSelectedCase(null)}
          onRefresh={() => {
            handleRefresh();
            // refresh selected case
            const updated = storageService.getAllCases().find((c) => c.caseId === selectedCase.caseId);
            if (updated) setSelectedCase(updated);
          }}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          user={currentUser}
          isOpen={showChangePasswordModal}
          isMandatory={currentUser.mustChangePassword}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={(updatedUser) => {
            onUpdateCurrentUser(updatedUser);
            setShowChangePasswordModal(false);
            alert('Đổi mật khẩu thành công!');
          }}
        />
      )}
    </div>
  );
};
