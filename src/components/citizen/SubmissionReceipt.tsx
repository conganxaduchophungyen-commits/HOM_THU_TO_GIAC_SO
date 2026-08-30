import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Printer,
  Search,
  Shield,
  Clock,
  MapPin,
  Lock,
  ArrowRight,
  Share2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { CaseRecord } from '../../types';
import { CATEGORY_DETAILS, DUC_HOP_COMMUNE_INFO } from '../../constants/policeData';

interface SubmissionReceiptProps {
  caseRecord: CaseRecord;
  onGoToTrack: (caseId: string, trackingCode: string) => void;
  onGoHome: () => void;
}

export const SubmissionReceipt: React.FC<SubmissionReceiptProps> = ({
  caseRecord,
  onGoToTrack,
  onGoHome,
}) => {
  const [copiedCaseId, setCopiedCaseId] = useState(false);
  const [copiedTrackingCode, setCopiedTrackingCode] = useState(false);

  const handleCopy = (text: string, type: 'caseId' | 'tracking') => {
    navigator.clipboard.writeText(text);
    if (type === 'caseId') {
      setCopiedCaseId(true);
      setTimeout(() => setCopiedCaseId(false), 2000);
    } else {
      setCopiedTrackingCode(true);
      setTimeout(() => setCopiedTrackingCode(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Success Card with Official Police Seal Styling */}
      <div className="bg-white rounded-2xl border-2 border-emerald-600 shadow-2xl overflow-hidden print:shadow-none print:border-slate-400">
        {/* Receipt Header Banner */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white p-6 text-center border-b-2 border-amber-400">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/90 text-white mx-auto flex items-center justify-center mb-3 shadow-lg border border-white/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">
            {DUC_HOP_COMMUNE_INFO.unitTitle} • TỈNH HƯNG YÊN
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            TIẾP NHẬN THÔNG TIN THÀNH CÔNG
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-md mx-auto">
            Hồ sơ phản ánh của bạn đã được ghi nhận vào hệ thống nghiệp vụ và chuyển đến Ban Chỉ huy Công an xã Đức Hợp để thụ lý.
          </p>
        </div>

        {/* Security Codes Highlight Box */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-red-50/40 border-2 border-dashed border-amber-400 space-y-4">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-red-950 font-black text-xs uppercase shadow-sm">
                <Lock className="w-3.5 h-3.5" /> THÔNG TIN TRA CỨU BẢO MẬT
              </span>
              <p className="text-[11px] text-slate-600 mt-1">
                Lưu lại 02 mã dưới đây để tra cứu tiến độ xử lý hồ sơ. Tuyệt đối không chia sẻ mã cho người lạ:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Mã Hồ Sơ */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    MÃ HỒ SƠ TIẾP NHẬN
                  </span>
                  <div className="text-lg font-black text-red-950 font-mono mt-1 select-all">
                    {caseRecord.caseId}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(caseRecord.caseId, 'caseId')}
                  className="mt-3 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCaseId ? 'Đã chép mã' : 'Sao chép mã hồ sơ'}</span>
                </button>
              </div>

              {/* Mã Tra Cứu Bảo Mật */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    MÃ TRA CỨU BẢO MẬT
                  </span>
                  <div className="text-lg font-black text-blue-900 font-mono mt-1 select-all">
                    {caseRecord.publicTrackingCode}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(caseRecord.publicTrackingCode, 'tracking')}
                  className="mt-3 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedTrackingCode ? 'Đã chép mã' : 'Sao chép mã tra cứu'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs divide-y divide-slate-200">
            <div className="grid grid-cols-3 p-3 bg-slate-50">
              <span className="text-slate-500 font-semibold">Loại hình:</span>
              <span className="col-span-2 font-bold text-slate-900">
                {CATEGORY_DETAILS[caseRecord.category]?.label || caseRecord.category}
              </span>
            </div>
            <div className="grid grid-cols-3 p-3">
              <span className="text-slate-500 font-semibold">Địa bàn:</span>
              <span className="col-span-2 font-bold text-slate-900">
                Thôn {caseRecord.village}, Xã Đức Hợp, Tỉnh Hưng Yên
              </span>
            </div>
            <div className="grid grid-cols-3 p-3 bg-slate-50">
              <span className="text-slate-500 font-semibold">Thời điểm gửi:</span>
              <span className="col-span-2 text-slate-800">
                {new Date(caseRecord.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="grid grid-cols-3 p-3">
              <span className="text-slate-500 font-semibold">Hạn xử lý dự kiến:</span>
              <span className="col-span-2 font-bold text-red-900">
                {caseRecord.deadline ? new Date(caseRecord.deadline).toLocaleDateString('vi-VN') : 'Đang xác định'}
              </span>
            </div>
            <div className="grid grid-cols-3 p-3 bg-slate-50">
              <span className="text-slate-500 font-semibold">Trạng thái tiếp nhận:</span>
              <span className="col-span-2 font-bold text-blue-800">
                MỚI TIẾP NHẬN (Đang phân loại & xử lý)
              </span>
            </div>
          </div>

          {/* Citizen Notice Box */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-800" />
              <span>Cam kết bảo mật & Trách nhiệm của cơ quan Công an:</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Thông tin bạn cung cấp được bảo mật tuyệt đối. Cán bộ Công an xã phụ trách địa bàn Thôn {caseRecord.village}
              sẽ tiến hành xác minh và xử lý theo quy định pháp luật.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
            <button
              onClick={() => onGoToTrack(caseRecord.caseId, caseRecord.publicTrackingCode)}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>TRA CỨU TIẾN ĐỘ NGAY</span>
            </button>
            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>In phiếu tiếp nhận</span>
            </button>
            <button
              onClick={onGoHome}
              className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
