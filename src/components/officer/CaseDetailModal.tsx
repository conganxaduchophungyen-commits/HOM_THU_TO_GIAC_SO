import React, { useState } from 'react';
import {
  X,
  Shield,
  UserCheck,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  Send,
  MessageSquare,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  UserPlus,
  Trash2,
  Printer,
  ChevronRight,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { CaseRecord, CaseStatus, OfficerUser } from '../../types';
import {
  STATUS_DETAILS,
  CATEGORY_DETAILS,
  PRIORITY_DETAILS,
  DUC_HOP_COMMUNE_INFO,
} from '../../constants/policeData';
import { storageService } from '../../services/storageService';

interface CaseDetailModalProps {
  caseRecord: CaseRecord | null;
  currentUser: OfficerUser;
  officersList: OfficerUser[];
  onClose: () => void;
  onRefresh: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseRecord,
  currentUser,
  officersList,
  onClose,
  onRefresh,
}) => {
  if (!caseRecord) return null;

  // Workflow State
  const [selectedNextStatus, setSelectedNextStatus] = useState<CaseStatus>(caseRecord.status);
  const [statusReason, setStatusReason] = useState('');
  const [resolutionReport, setResolutionReport] = useState(caseRecord.resolutionReport || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Assignment State
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>(
    caseRecord.assignedToOfficerIds || []
  );
  const [assignmentNote, setAssignmentNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Internal Notes State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Allowed next transitions based on current status
  const allowedTransitions = storageService.getAllowedNextStatuses(caseRecord.status);

  // Permission checks
  const canAssign =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'CHIEF' ||
    currentUser.role === 'DEPUTY_CHIEF';
  const canDelete = currentUser.role === 'SUPER_ADMIN';

  // Handlers
  const handleUpdateStatus = () => {
    setStatusError(null);
    if (selectedNextStatus === caseRecord.status) return;

    if (!statusReason.trim()) {
      setStatusError('Vui lòng nhập lý do/căn cứ nghiệp vụ khi chuyển trạng thái hồ sơ.');
      return;
    }

    if (selectedNextStatus === 'RESOLVED' && !resolutionReport.trim()) {
      setStatusError('Vui lòng nhập nội dung Báo cáo kết quả giải quyết vụ việc.');
      return;
    }

    setIsUpdatingStatus(true);
    const res = storageService.updateCaseStatus(
      caseRecord.caseId,
      selectedNextStatus,
      statusReason.trim(),
      selectedNextStatus === 'RESOLVED' ? resolutionReport.trim() : undefined
    );
    setIsUpdatingStatus(false);

    if (res.success) {
      setStatusReason('');
      onRefresh();
    } else {
      setStatusError(res.message);
    }
  };

  const handleSaveAssignment = () => {
    setIsAssigning(true);
    const success = storageService.assignCase(
      caseRecord.caseId,
      selectedOfficers,
      assignmentNote.trim() || undefined
    );
    setIsAssigning(false);
    if (success) {
      onRefresh();
    }
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    setIsAddingNote(true);
    const success = storageService.addInternalNote(caseRecord.caseId, newNoteContent.trim());
    setIsAddingNote(false);
    if (success) {
      setNewNoteContent('');
      onRefresh();
    }
  };

  const handleDeleteCase = () => {
    if (
      confirm(
        `Đồng chí có chắc chắn muốn XÓA VĨNH VIỄN hồ sơ ${caseRecord.caseId}? Hành động này chỉ dành cho Super Admin và sẽ được ghi vết vào Audit Log an ninh.`
      )
    ) {
      storageService.deleteCase(caseRecord.caseId);
      onClose();
      onRefresh();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white p-5 flex items-center justify-between border-b border-amber-400/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>HỒ SƠ NGHIỆP VỤ CAX</span>
                <span>•</span>
                <span className="font-mono">{caseRecord.caseId}</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {CATEGORY_DETAILS[caseRecord.category]?.label || caseRecord.category}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="In phiếu nghiệp vụ"
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 flex-1">
          {/* Top Quick Status & Meta Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">TRẠNG THÁI</span>
              <span
                className={`inline-block mt-1 px-2.5 py-1 rounded text-xs font-black border ${
                  STATUS_DETAILS[caseRecord.status]?.badgeColor
                }`}
              >
                {STATUS_DETAILS[caseRecord.status]?.label}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">MỨC ĐỘ KHẨN CẤP</span>
              <span
                className={`inline-block mt-1 px-2.5 py-1 rounded text-xs font-black border ${
                  PRIORITY_DETAILS[caseRecord.priority]?.badgeColor
                }`}
              >
                {PRIORITY_DETAILS[caseRecord.priority]?.label}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">ĐỊA BÀN THÔN</span>
              <span className="text-xs font-black text-red-950 mt-1 block">
                Thôn {caseRecord.village}, Xã Đức Hợp
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">HẠN XỬ LÝ</span>
              <span className="text-xs font-black text-red-900 mt-1 block font-mono">
                {caseRecord.deadline ? new Date(caseRecord.deadline).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}
              </span>
            </div>
          </div>

          {/* Details & Reporter 2-Col Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col (2/3): Case Details & Attachments */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b border-slate-100 pb-2">
                  1. NỘI DUNG VỤ VIỆC CHI TIẾT
                </h4>

                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Thời gian xảy ra:</span>
                  <span className="font-medium text-slate-900">{caseRecord.incidentDate}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Địa điểm xảy ra:</span>
                  <span className="font-medium text-slate-900">{caseRecord.incidentLocation}</span>
                </div>

                {caseRecord.latitude && caseRecord.longitude && (
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span>
                        Tọa độ GPS: {caseRecord.latitude}, {caseRecord.longitude}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${caseRecord.latitude},${caseRecord.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-blue-800 underline hover:text-blue-900"
                    >
                      Mở Google Maps
                    </a>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Mô tả hành vi vi phạm:</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {caseRecord.description}
                  </div>
                </div>

                {caseRecord.suspectDescription && (
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5">
                      Đối tượng / Phương tiện liên quan:
                    </span>
                    <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-amber-950 font-medium">
                      {caseRecord.suspectDescription}
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase">
                    2. TÀI LIỆU, HÌNH ẢNH, VIDEO ĐÍNH KÈM ({caseRecord.attachments?.length || 0})
                  </h4>
                </div>

                {caseRecord.attachments && caseRecord.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {caseRecord.attachments.map((att) => (
                      <div
                        key={att.attachmentId}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {att.mimeType.startsWith('image/') && att.dataUrl ? (
                            <img
                              src={att.dataUrl}
                              alt="thumbnail"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="font-semibold text-slate-900 truncate block">
                              {att.fileName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {(att.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>

                        {att.dataUrl && (
                          <a
                            href={att.dataUrl}
                            download={att.fileName}
                            className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-800 transition-colors"
                          >
                            Tải về
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Không có tài liệu đính kèm.</p>
                )}
              </div>
            </div>

            {/* Right Col (1/3): Reporter & Assignment & Timeline */}
            <div className="space-y-4">
              {/* Reporter Info Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>NGƯỜI BÁO TIN</span>
                  <span className="font-mono text-[10px] text-slate-500">Mã: {caseRecord.publicTrackingCode}</span>
                </h4>

                {caseRecord.anonymous ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>CUNG CẤP ẨN DANH 100%</span>
                    </div>
                    <p className="text-[11px] text-emerald-900/90 leading-snug">
                      Người cung cấp lựa chọn không lưu thông tin cá nhân. Danh tính được bảo mật tuyệt đối theo luật định.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold block">Họ và tên:</span>
                      <span className="font-bold text-slate-900">{caseRecord.reporterName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Điện thoại:</span>
                      <a
                        href={`tel:${caseRecord.reporterPhone}`}
                        className="font-bold text-blue-900 font-mono flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{caseRecord.reporterPhone}</span>
                      </a>
                    </div>
                    {caseRecord.reporterEmail && (
                      <div>
                        <span className="text-slate-500 font-semibold block">Email:</span>
                        <span className="text-slate-800">{caseRecord.reporterEmail}</span>
                      </div>
                    )}
                    {caseRecord.reporterAddress && (
                      <div>
                        <span className="text-slate-500 font-semibold block">Địa chỉ cư trú:</span>
                        <span className="text-slate-800">{caseRecord.reporterAddress}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assignment Control Box (For Leadership / Admin) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>CÁN BỘ THỤ LÝ</span>
                  <UserCheck className="w-4 h-4 text-red-800" />
                </h4>

                {canAssign ? (
                  <div className="space-y-3">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Chọn cán bộ thụ lý hồ sơ:
                    </label>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50">
                      {officersList
                        .filter((o) => o.role !== 'SUPER_ADMIN')
                        .map((officer) => {
                          const isAssigned = selectedOfficers.includes(officer.userId);
                          return (
                            <label
                              key={officer.userId}
                              className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-white cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOfficers((prev) => [...prev, officer.userId]);
                                  } else {
                                    setSelectedOfficers((prev) =>
                                      prev.filter((id) => id !== officer.userId)
                                    );
                                  }
                                }}
                                className="rounded text-red-900 focus:ring-red-900"
                              />
                              <div>
                                <span className="font-bold text-slate-900">{officer.fullName}</span>
                                <span className="text-[10px] text-slate-500 block">
                                  {officer.rank} • {officer.position}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                    </div>

                    <input
                      type="text"
                      value={assignmentNote}
                      onChange={(e) => setAssignmentNote(e.target.value)}
                      placeholder="Ghi chú phân công chỉ đạo..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />

                    <button
                      type="button"
                      onClick={handleSaveAssignment}
                      disabled={isAssigning}
                      className="w-full py-2 rounded-lg bg-red-900 hover:bg-red-800 text-white font-bold text-xs transition-colors"
                    >
                      {isAssigning ? 'Đang lưu...' : 'Lưu phân công cán bộ'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-xs">
                    {caseRecord.assignedOfficerNames && caseRecord.assignedOfficerNames.length > 0 ? (
                      caseRecord.assignedOfficerNames.map((name, i) => (
                        <div key={i} className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-800"></span>
                          <span>{name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Chưa phân công cán bộ</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Status Transition Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  QUY TRÌNH NGHIỆP VỤ (STATE MACHINE)
                </span>
                <h4 className="text-sm font-extrabold text-white mt-0.5">
                  CHUYỂN TRẠNG THÁI HỒ SƠ
                </h4>
              </div>
              <div className="text-xs">
                Hiện tại: <span className="font-bold text-amber-300">{STATUS_DETAILS[caseRecord.status]?.label}</span>
              </div>
            </div>

            {statusError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold">
                {statusError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chọn trạng thái tiếp theo:
                </label>
                <select
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value as CaseStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white font-bold text-xs focus:ring-2 focus:ring-amber-400"
                >
                  <option value={caseRecord.status}>
                    -- Giữ nguyên ({STATUS_DETAILS[caseRecord.status]?.label}) --
                  </option>
                  {allowedTransitions.map((nextSt) => (
                    <option key={nextSt} value={nextSt}>
                      → {STATUS_DETAILS[nextSt]?.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Lý do / Căn cứ nghiệp vụ thay đổi: <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Nhập lý do, căn cứ theo thông tư/quy định..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Resolution Report Input if RESOLVED */}
            {selectedNextStatus === 'RESOLVED' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-semibold text-amber-300">
                  Nội dung Báo cáo Kết quả giải quyết vụ việc (Công khai cho người dân tra cứu): <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={resolutionReport}
                  onChange={(e) => setResolutionReport(e.target.value)}
                  placeholder="Công an xã đã tiến hành xác minh làm rõ, mời các đối tượng lên làm việc, lập biên bản xử lý theo quy định pháp luật..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-xs leading-relaxed focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || selectedNextStatus === caseRecord.status}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus ? 'Đang cập nhật...' : 'XÁC NHẬN CHUYỂN TRẠNG THÁI'}
              </button>
            </div>
          </div>

          {/* Internal Notes Thread */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-red-800" />
              <span>GHI CHÚ NGHIỆP VỤ NỘI BỘ ({caseRecord.internalNotes?.length || 0})</span>
            </h4>

            {caseRecord.internalNotes && caseRecord.internalNotes.length > 0 ? (
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {caseRecord.internalNotes.map((note, noteIdx) => {
                  const isString = typeof note === 'string';
                  const noteKey = isString ? `str-note-${noteIdx}` : (note.noteId || `note-${noteIdx}`);
                  const officerName = isString ? 'Ghi chú nghiệp vụ' : (note.officerName || 'Cán bộ');
                  const createdAt = isString ? caseRecord.createdAt : note.createdAt;
                  const content = isString ? note : note.content;

                  return (
                    <div key={noteKey} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-red-950">{officerName}</span>
                        <span className="text-[10px] text-slate-400">
                          {createdAt ? new Date(createdAt).toLocaleString('vi-VN') : ''}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{content}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 italic">Chưa có ghi chú nghiệp vụ nào.</p>
            )}

            {/* Add note input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Nhập ghi chú ý kiến chỉ đạo hoặc tiến độ xác minh..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={isAddingNote || !newNoteContent.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                Thêm ghi chú
              </button>
            </div>
          </div>

          {/* Timeline History */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b border-slate-200 pb-2">
              NHẬT KÝ TIẾN TRÌNH HỒ SƠ
            </h4>
            <div className="space-y-2">
              {caseRecord.timeline?.map((item, itemIdx) => (
                <div key={item.timelineId || `timeline-${itemIdx}`} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-800 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-900">{item.action}</span>
                    <span className="text-slate-500 text-[11px]"> bởi {item.performedBy}</span>
                    <span className="text-slate-400 text-[10px] ml-2">
                      ({new Date(item.timestamp).toLocaleString('vi-VN')})
                    </span>
                    {item.notes && <p className="text-slate-600 text-[11px] mt-0.5">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            {canDelete && (
              <button
                type="button"
                onClick={handleDeleteCase}
                className="px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa hồ sơ (Super Admin)</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
