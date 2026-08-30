import React, { useState } from 'react';
import {
  Search,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText,
  Calendar,
  MessageSquare,
  Send,
  CornerDownRight,
  ArrowRight,
  Info,
} from 'lucide-react';
import { CaseRecord, CaseStatus } from '../../types';
import {
  STATUS_DETAILS,
  CATEGORY_DETAILS,
  PRIORITY_DETAILS,
  DUC_HOP_COMMUNE_INFO,
} from '../../constants/policeData';
import { storageService } from '../../services/storageService';

interface CaseTrackerProps {
  initialCaseId?: string;
  initialTrackingCode?: string;
}

export const CaseTracker: React.FC<CaseTrackerProps> = ({
  initialCaseId = '',
  initialTrackingCode = '',
}) => {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<CaseRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Additional info submit (when WAITING_INFO)
  const [additionalNote, setAdditionalNote] = useState('');
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [supplementSuccess, setSupplementSuccess] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSearchResult(null);
    setSupplementSuccess(false);

    if (!caseId.trim() || !trackingCode.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Mã hồ sơ và Mã tra cứu bảo mật.');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      const found = storageService.trackCase(caseId.trim(), trackingCode.trim());
      setIsSearching(false);
      if (found) {
        setSearchResult(found);
      } else {
        setErrorMsg('Không tìm thấy hồ sơ phù hợp. Vui lòng kiểm tra lại chính xác Mã hồ sơ và Mã tra cứu bảo mật.');
      }
    }, 300);
  };

  const handleAddInformation = () => {
    if (!searchResult || !additionalNote.trim()) return;

    setIsSubmittingInfo(true);
    try {
      const success = storageService.addPublicSupplement(
        searchResult.caseId,
        additionalNote.trim()
      );
      setIsSubmittingInfo(false);
      if (success) {
        setSupplementSuccess(true);
        setAdditionalNote('');
        // Refresh case
        const refreshed = storageService.trackCase(caseId.trim(), trackingCode.trim());
        if (refreshed) setSearchResult(refreshed);
      }
    } catch (err: any) {
      setIsSubmittingInfo(false);
      alert('Có lỗi xảy ra khi gửi bổ sung thông tin: ' + err?.message);
    }
  };

  // State flow mapping for public progress view
  const workflowStages: { status: CaseStatus; label: string }[] = [
    { status: 'NEW', label: '1. Tiếp nhận' },
    { status: 'RECEIVED', label: '2. Đã ghi sổ' },
    { status: 'CLASSIFIED', label: '3. Phân loại' },
    { status: 'ASSIGNED', label: '4. Phân công cán bộ' },
    { status: 'PROCESSING', label: '5. Đang xác minh' },
    { status: 'RESOLVED', label: '6. Đã giải quyết' },
    { status: 'ARCHIVED', label: '7. Lưu trữ' },
  ];

  const getStageIndex = (status: CaseStatus) => {
    if (status === 'REJECTED') return -1;
    if (status === 'WAITING_INFO') return 4;
    const idx = workflowStages.findIndex((s) => s.status === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-6 border-b border-blue-400/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Search className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                TRA CỨU TRỰC TUYẾN 24/7
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                TRA CỨU TIẾN ĐỘ XỬ LÝ HỒ SƠ
              </h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Mã hồ sơ <span className="text-red-600">*</span>
              </label>
              <input
                id="input-track-caseId"
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value.toUpperCase())}
                placeholder="VD: DH-2026-000001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 uppercase font-bold focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Mã tra cứu bảo mật <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="input-track-code"
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="VD: TK-7842-101"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 uppercase font-bold focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              id="btn-search-case"
              disabled={isSearching}
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'Đang kiểm tra hệ thống...' : 'TRA CỨU TIẾN ĐỘ'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result Display Card */}
      {searchResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn space-y-6 p-6 sm:p-8">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 font-mono">MÃ HỒ SƠ:</span>
                <span className="text-base font-black text-red-950 font-mono">{searchResult.caseId}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Tiếp nhận ngày: {new Date(searchResult.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border shadow-sm ${
                  STATUS_DETAILS[searchResult.status]?.badgeColor
                }`}
              >
                {STATUS_DETAILS[searchResult.status]?.label || searchResult.status}
              </span>
            </div>
          </div>

          {/* Workflow Progress Bar */}
          {searchResult.status !== 'REJECTED' ? (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900">TIẾN TRÌNH THỰC HIỆN:</div>
              <div className="relative">
                {/* Visual Step Dots */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {workflowStages.map((stage, idx) => {
                    const currentIdx = getStageIndex(searchResult.status);
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={stage.status} className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-blue-900 text-white ring-4 ring-blue-100 shadow'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] font-semibold hidden md:block leading-tight ${
                            isCurrent ? 'text-blue-900 font-bold' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {stage.label.split('. ')[1]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-red-700" />
                <span>Hồ sơ đã được xử lý (Từ chối tiếp nhận / Không thuộc thẩm quyền)</span>
              </div>
              <p className="text-slate-700">
                Lý do: Hồ sơ không thuộc thẩm quyền giải quyết của Công an xã hoặc không đủ căn cứ xác minh.
              </p>
            </div>
          )}

          {/* Status Message / Notification to Citizen */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-800" />
              <span>Thông báo từ Công an xã Đức Hợp:</span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">
              {searchResult.status === 'NEW' &&
                'Hồ sơ đang trong giai đoạn tiếp nhận ban đầu và chờ Lãnh đạo Công an xã duyệt phân loại.'}
              {searchResult.status === 'RECEIVED' &&
                'Công an xã đã vào Sổ tiếp nhận tin báo và chuẩn bị phân loại giao tổ công tác.'}
              {searchResult.status === 'CLASSIFIED' &&
                'Hồ sơ đã được phân loại theo thẩm quyền nghiệp vụ và chờ phân công cán bộ thụ lý.'}
              {searchResult.status === 'ASSIGNED' &&
                'Hồ sơ đã được phân công cho Cán bộ Công an phụ trách địa bàn tiến hành kiểm tra, xác minh.'}
              {searchResult.status === 'PROCESSING' &&
                'Cán bộ Công an xã đang tiến hành các biện pháp nghiệp vụ xác minh, thu thập thông tin hiện trường.'}
              {searchResult.status === 'WAITING_INFO' &&
                'Cơ quan Công an cần công dân cung cấp bổ sung thêm một số thông tin để phục vụ xác minh. Vui lòng nhập nội dung bên dưới.'}
              {searchResult.status === 'RESOLVED' &&
                'Vụ việc đã được xác minh làm rõ và giải quyết theo đúng quy định của pháp luật.'}
              {searchResult.status === 'ARCHIVED' &&
                'Hồ sơ đã hoàn tất quá trình xử lý và được lưu trữ nghiệp vụ.'}
            </p>

            {/* Public Resolution Report if resolved */}
            {searchResult.resolutionReport && searchResult.status === 'RESOLVED' && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-1">Kết quả giải quyết:</span>
                <p className="leading-relaxed">{searchResult.resolutionReport}</p>
              </div>
            )}
          </div>

          {/* Case Details Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                THÔNG TIN VỤ VIỆC
              </span>
              <div>
                <span className="text-slate-500 font-semibold">Loại hình: </span>
                <span className="font-bold text-slate-900">
                  {CATEGORY_DETAILS[searchResult.category]?.label || searchResult.category}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Địa bàn: </span>
                <span className="font-bold text-slate-900">
                  Thôn {searchResult.village}, Xã Đức Hợp, Tỉnh Hưng Yên
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Địa điểm cụ thể: </span>
                <span className="text-slate-800">{searchResult.incidentLocation}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Hạn giải quyết: </span>
                <span className="font-bold text-red-900 font-mono">
                  {searchResult.deadline ? new Date(searchResult.deadline).toLocaleDateString('vi-VN') : 'Đang xử lý'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                TÀI LIỆU & BẢO MẬT
              </span>
              <div>
                <span className="text-slate-500 font-semibold">Tài liệu đã gửi: </span>
                <span className="font-bold text-slate-900">{searchResult.attachments?.length || 0} tệp</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Bảo mật danh tính: </span>
                <span className="font-bold text-emerald-700">Tuyệt đối (Mã hóa an ninh)</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Đơn vị xử lý: </span>
                <span className="font-bold text-red-950">Công an xã Đức Hợp</span>
              </div>
            </div>
          </div>

          {/* Supplement Information Box (If WAITING_INFO or Citizen wants to add more) */}
          <div className="p-4 sm:p-5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>Gửi bổ sung thông tin / Bằng chứng mới cho Công an xã</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Nếu bạn có thêm thông tin, ảnh chụp, video clip hoặc diễn biến mới liên quan đến vụ việc này,
              hãy gửi bổ sung trực tiếp vào hồ sơ:
            </p>

            {supplementSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã gửi bổ sung thông tin thành công vào hồ sơ!</span>
              </div>
            )}

            <div className="flex gap-2">
              <textarea
                rows={2}
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
                placeholder="Nhập nội dung bổ sung hoặc ghi chú mới cho Công an xã..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddInformation}
                disabled={isSubmittingInfo || !additionalNote.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 self-end"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingInfo ? 'Đang gửi...' : 'Gửi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
