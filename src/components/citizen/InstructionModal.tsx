import React from 'react';
import { BookOpen, CheckCircle, AlertTriangle, ShieldCheck, PhoneCall, X, FileText, Lock } from 'lucide-react';
import { DUC_HOP_COMMUNE_INFO } from '../../constants/policeData';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 text-white p-5 flex items-center justify-between border-b border-amber-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                HƯỚNG DẪN NGHIỆP VỤ & QUY TRÌNH
              </div>
              <h3 className="text-base font-extrabold text-white">
                QUY TRÌNH TIẾP NHẬN & XỬ LÝ TIN TỐ GIÁC
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Step by Step Guide */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-red-950 uppercase border-b border-red-100 pb-1.5">
              1. Các bước gửi tin phản ánh & tố giác
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-100 space-y-1">
                <span className="w-6 h-6 rounded-full bg-red-900 text-white text-xs font-black inline-flex items-center justify-center mb-1">
                  1
                </span>
                <h5 className="font-bold text-slate-900 text-xs">Điền thông tin vụ việc</h5>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Chọn đúng loại hình phản ánh, chọn Thôn xảy ra vụ việc trong 11 Thôn, thời gian và mô tả chi tiết.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
                <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black inline-flex items-center justify-center mb-1">
                  2
                </span>
                <h5 className="font-bold text-slate-900 text-xs">Đính kèm bằng chứng</h5>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Tải lên ảnh chụp, video, âm thanh hoặc tài liệu liên quan (nếu có) để tăng tính xác thực cho tin báo.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-black inline-flex items-center justify-center mb-1">
                  3
                </span>
                <h5 className="font-bold text-slate-900 text-xs">Lưu mã & Tra cứu</h5>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Hệ thống cấp Mã hồ sơ và Mã tra cứu bảo mật. Dùng 2 mã này để theo dõi tiến độ xử lý trực tuyến.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Protection */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
              <Lock className="w-4 h-4 text-emerald-700" />
              Cam kết bảo mật tuyệt đối thông tin người tố giác
            </h4>
            <p className="text-[11px] leading-relaxed text-emerald-900/90">
              Theo quy định của Bộ luật Tố tụng Hình sự và Luật Tố cáo: Cơ quan Công an có trách nhiệm giữ bí mật tuyệt đối
              danh tính, hình ảnh, địa chỉ và thông tin liên hệ của người cung cấp tin báo, tố giác tội phạm. Mọi hành vi
              tiết lộ thông tin người tố giác đều bị xử lý nghiêm minh theo quy định của pháp luật.
            </p>
          </div>

          {/* Emergency Note */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 space-y-2">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-700" />
              Trường hợp khẩn cấp
            </h4>
            <p className="text-[11px] leading-relaxed text-red-900/90">
              Nếu vụ việc đang diễn ra gây nguy hiểm đến tính mạng, sức khỏe hoặc tài sản, đề nghị người dân gọi điện trực tiếp
              đến đường dây nóng Trực ban Công an xã Đức Hợp:{' '}
              <strong className="text-red-950 font-mono text-xs">02213.815.999</strong> hoặc số điện thoại khẩn cấp 113.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export const LegalNoticeModal: React.FC<InstructionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 text-white p-5 flex items-center justify-between border-b border-amber-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                CƠ SỞ PHÁP LÝ & QUY ĐỊNH
              </div>
              <h3 className="text-base font-extrabold text-white">
                QUY ĐỊNH PHÁP LUẬT VỀ TỐ GIÁC TỘI PHẠM
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase text-red-950">
              1. Quyền và nghĩa vụ của công dân
            </h4>
            <p>
              Mọi công dân có quyền và nghĩa vụ phát hiện, tố giác, báo tin về hành vi vi phạm pháp luật và tội phạm tới
              cơ quan Công an có thẩm quyền theo quy định tại Điều 144 Bộ luật Tố tụng Hình sự năm 2015.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase text-red-950">
              2. Trách nhiệm pháp lý đối với hành vi vu khống, báo tin giả
            </h4>
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-950 space-y-1.5">
              <p className="font-semibold">
                Nghiêm cấm mọi hành vi lợi dụng hòm thư tố giác tội phạm để:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-900">
                <li>Vu khống, bôi nhọ, xúc phạm danh dự, nhân phẩm của tổ chức, cá nhân.</li>
                <li>Báo tin sai sự thật, tin giả nhằm mục đích quấy rối hoặc gây hoang mang dư luận.</li>
                <li>Gửi thông tin rác, mã độc phá hoại hệ thống an ninh mạng của cơ quan nhà nước.</li>
              </ul>
              <p className="text-[11px] italic pt-1 text-slate-700">
                * Hành vi cố ý tố giác sai sự thật sẽ bị xử phạt vi phạm hành chính hoặc truy cứu trách nhiệm hình sự
                về tội “Vu khống” theo Điều 156 Bộ luật Hình sự.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase text-red-950">
              3. Cơ chế tiếp nhận tại Công an xã Đức Hợp
            </h4>
            <p>
              Công an xã Đức Hợp tổ chức tiếp nhận, phân loại, ghi sổ theo dõi và báo cáo Lãnh đạo chỉ huy để phân công cán bộ
              xác minh, giải quyết đúng thời hạn quy định.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
