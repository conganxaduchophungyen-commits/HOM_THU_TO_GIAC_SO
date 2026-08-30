import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  BookOpen,
  QrCode,
  Lock,
  PhoneCall,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Users,
  Building,
  FileCheck,
  Share2,
} from 'lucide-react';
import { DUC_HOP_COMMUNE_INFO, DUC_HOP_VILLAGES, CATEGORY_DETAILS } from '../../constants/policeData';

interface CitizenHomeProps {
  onGoToSubmit: () => void;
  onGoToTrack: () => void;
  onGoToGuide: () => void;
  onOpenLegalNotice: () => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  onGoToSubmit,
  onGoToTrack,
  onGoToGuide,
  onOpenLegalNotice,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 pb-10 text-[#1a1a1a]">
      {/* High Density Main Grid: Content Area + High Density Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hero Channel Card & 3 Primary Action Buttons */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Welcome Official Channel Banner */}
          <section className="bg-white border border-gray-200 p-5 sm:p-6 rounded-lg shadow-sm flex flex-col justify-center">
            <div className="text-xs font-black uppercase text-[#8B0000] tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8B0000]"></span>
              {DUC_HOP_COMMUNE_INFO.unitTitle} • TỈNH HƯNG YÊN
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1a365d] mb-2.5 border-l-4 border-[#8B0000] pl-3.5 leading-tight">
              Kênh tiếp nhận thông tin an ninh trật tự chính thức 24/7
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base italic">
              Hệ thống tiếp nhận thông tin tố giác tội phạm, tin báo về hành vi vi phạm pháp luật và phản ánh về tình hình an ninh, trật tự trên địa bàn xã Đức Hợp. Chúng tôi cam kết bảo mật danh tính người cung cấp thông tin tuyệt đối.
            </p>
          </section>

          {/* 3 High-Density Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Submit */}
            <button
              id="btn-hero-submit"
              onClick={onGoToSubmit}
              className="group bg-white border-2 border-[#8B0000] rounded-xl flex flex-col items-center justify-center gap-3.5 hover:bg-[#8B0000] hover:text-white transition-all shadow-md p-5 text-center cursor-pointer active:scale-[0.98]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#8B0000] group-hover:bg-white text-white group-hover:text-[#8B0000] rounded-full flex items-center justify-center shadow-md transition-all">
                <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <span className="font-black text-center text-base sm:text-lg uppercase leading-tight block text-slate-900 group-hover:text-white">
                  Gửi Tố Giác /<br />Phản Ánh
                </span>
                <span className="text-[11px] font-semibold text-red-800 group-hover:text-amber-200 mt-1 block">
                  Ẩn danh 100% • Bảo mật
                </span>
              </div>
            </button>

            {/* Card 2: Track */}
            <button
              id="btn-hero-track"
              onClick={onGoToTrack}
              className="group bg-white border-2 border-[#1a365d] rounded-xl flex flex-col items-center justify-center gap-3.5 hover:bg-[#1a365d] hover:text-white transition-all shadow-md p-5 text-center cursor-pointer active:scale-[0.98]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1a365d] group-hover:bg-white text-white group-hover:text-[#1a365d] rounded-full flex items-center justify-center shadow-md transition-all">
                <Search className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <span className="font-black text-center text-base sm:text-lg uppercase leading-tight block text-slate-900 group-hover:text-white">
                  Tra Cứu<br />Hồ Sơ
                </span>
                <span className="text-[11px] font-semibold text-blue-900 group-hover:text-cyan-200 mt-1 block">
                  Mã tra cứu & PIN riêng
                </span>
              </div>
            </button>

            {/* Card 3: Guide */}
            <button
              id="btn-hero-guide"
              onClick={onGoToGuide}
              className="group bg-white border-2 border-[#718096] rounded-xl flex flex-col items-center justify-center gap-3.5 hover:bg-[#718096] hover:text-white transition-all shadow-md p-5 text-center cursor-pointer active:scale-[0.98]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#718096] group-hover:bg-white text-white group-hover:text-[#718096] rounded-full flex items-center justify-center shadow-md transition-all">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <span className="font-black text-center text-base sm:text-lg uppercase leading-tight block text-slate-900 group-hover:text-white">
                  Hướng Dẫn<br />Sử Dụng
                </span>
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-white mt-1 block">
                  Quy trình & Pháp lý
                </span>
              </div>
            </button>
          </div>

          {/* 4 Pillars of Citizen Assurance */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm flex items-start space-x-3">
              <div className="p-2 rounded bg-red-50 text-[#8B0000] border border-red-200 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">Ẩn danh & Bảo mật tuyệt đối</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Người dân có thể lựa chọn không cung cấp thông tin cá nhân. Danh tính được mã hóa an toàn.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm flex items-start space-x-3">
              <div className="p-2 rounded bg-amber-50 text-amber-900 border border-amber-200 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">Tiếp nhận tức thì 24/7</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Hệ thống tự động thông báo đến cán bộ trực ban và Ban Chỉ huy CAX ngay khi có tin báo mới.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm flex items-start space-x-3">
              <div className="p-2 rounded bg-blue-50 text-[#1a365d] border border-blue-200 flex-shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">Tra cứu tiến độ minh bạch</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Mỗi tin báo được cấp 01 mã hồ sơ và mã tra cứu riêng biệt để theo dõi kết quả xử lý.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm flex items-start space-x-3">
              <div className="p-2 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">Xử lý đúng thẩm quyền</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Phân công cán bộ chuyên trách xác minh theo đúng quy định pháp luật và thông tư nghiệp vụ.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: High Density Sidebar (Ban Chỉ Huy & Quick QR) */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Ban Chỉ Huy Xã */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3.5 flex items-center gap-2 border-b border-gray-200 pb-2.5">
              <span className="w-2.5 h-2.5 bg-[#8B0000] rounded-full"></span>
              Ban Chỉ Huy Công An Xã Đức Hợp
            </h3>
            <div className="space-y-3">
              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Trưởng Công an xã</span>
                  <span className="text-[10px] text-[#8B0000] font-black">Toàn xã</span>
                </div>
                <p className="font-black text-base text-[#8B0000]">Thượng tá Đoàn Ngọc Quang</p>
                <a
                  href="tel:0983892222"
                  className="text-xs text-gray-700 hover:text-[#8B0000] font-mono font-bold flex items-center gap-1 mt-0.5"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-600" /> SĐT: 0983.892.222
                </a>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Phó phụ trách Hình sự</span>
                  <span className="text-[10px] text-[#1a365d] font-bold">3 thôn</span>
                </div>
                <p className="font-black text-sm text-[#1a365d]">Thiếu tá Phạm Văn Hài</p>
                <a
                  href="tel:0986106548"
                  className="text-xs text-gray-700 hover:text-[#1a365d] font-mono font-bold flex items-center gap-1 mt-0.5"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-600" /> SĐT: 0986.106.548
                </a>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Phó phụ trách Tổng hợp</span>
                  <span className="text-[10px] text-[#1a365d] font-bold">3 thôn</span>
                </div>
                <p className="font-black text-sm text-[#1a365d]">Trung tá Đặng Hồng Ngọc</p>
                <a
                  href="tel:0944061666"
                  className="text-xs text-gray-700 hover:text-[#1a365d] font-mono font-bold flex items-center gap-1 mt-0.5"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-600" /> SĐT: 0944.061.666
                </a>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Phó phụ trách CSTT</span>
                  <span className="text-[10px] text-[#1a365d] font-bold">3 thôn</span>
                </div>
                <p className="font-black text-sm text-[#1a365d]">Trung tá Vũ Văn Thu</p>
                <a
                  href="tel:0988178118"
                  className="text-xs text-gray-700 hover:text-[#1a365d] font-mono font-bold flex items-center gap-1 mt-0.5"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-600" /> SĐT: 0988.178.118
                </a>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="font-bold text-[#8B0000]">Trụ sở trực ban: </span>
              Thôn Nho Lâm, xã Đức Hợp, tỉnh Hưng Yên
            </div>
          </div>

          {/* Quick QR Access Banner */}
          <div className="bg-[#1a365d] text-white rounded-lg p-4 shadow-sm flex items-center gap-4 border border-[#1a365d]">
            <div
              onClick={() => setShowQrModal(true)}
              className="bg-white p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform flex-shrink-0 shadow"
            >
              <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center text-[#1a365d]">
                <QrCode className="w-full h-full text-[#1a365d]" />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase font-black text-[#FFD700] tracking-wider">Truy cập nhanh</p>
              <p className="text-xs font-medium leading-snug mt-1 text-slate-200">
                Quét mã QR để gửi tố giác và tra cứu hồ sơ ngay từ điện thoại di động.
              </p>
              <button
                onClick={() => setShowQrModal(true)}
                className="mt-2 text-[11px] font-bold text-[#FFD700] hover:underline flex items-center gap-1"
              >
                <span>Xem mã phóng to</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Categories Section */}
      <section className="bg-white rounded-lg p-5 sm:p-6 border border-gray-200 shadow-sm">
        <div className="max-w-3xl mb-5">
          <div className="text-xs font-black text-[#8B0000] uppercase tracking-wider mb-1">Danh mục nghiệp vụ</div>
          <h3 className="text-lg sm:text-xl font-black text-[#1a365d]">
            Các loại tin báo & phản ánh tiếp nhận xử lý
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Chọn danh mục phù hợp để hồ sơ được chuyển tới đúng cán bộ phụ trách lĩnh vực:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Object.entries(CATEGORY_DETAILS).map(([key, cat]) => (
            <div
              key={key}
              onClick={onGoToSubmit}
              className="p-4 rounded-lg border border-gray-200 hover:border-[#8B0000] hover:bg-red-50/20 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border mb-2 ${cat.badgeColor}`}>
                  {cat.label}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#8B0000] group-hover:text-red-700">
                <span>Gửi phản ánh</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11 Villages Covered in Duc Hop */}
      <section className="bg-white rounded-lg p-5 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-gray-200 pb-3">
          <div>
            <div className="text-xs font-black text-[#8B0000] uppercase tracking-wide">Phạm vi tiếp nhận</div>
            <h3 className="text-lg sm:text-xl font-black text-[#1a365d]">
              Địa bàn 11 Thôn trực thuộc xã Đức Hợp
            </h3>
          </div>
          <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#8B0000]" />
            <span>Trực thuộc Công an tỉnh Hưng Yên</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {DUC_HOP_VILLAGES.map((village, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-[#8B0000] transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8B0000]" />
                <span className="font-bold text-slate-900">Thôn {village}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-[#8B0000] relative">
            <div className="w-12 h-12 rounded-xl bg-[#8B0000] text-[#FFD700] mx-auto flex items-center justify-center mb-3 shadow">
              <QrCode className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              QUÉT MÃ QR TRÊN ĐIỆN THOẠI
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Mở camera hoặc ứng dụng Zalo trên điện thoại quét mã QR bên dưới để gửi tin báo nhanh không cần cài đặt.
            </p>

            <div className="p-4 bg-slate-50 border-2 border-dashed border-[#8B0000]/40 rounded-xl inline-block mb-4 shadow-inner">
              <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" rx="4" />
                <path d="M10 10h24v24h-24zM66 10h24v24h-24zM10 66h24v24h-24z" fill="#8B0000" />
                <path d="M14 14h16v16h-16zM70 14h16v16h-16zM14 70h16v16h-16z" fill="#ffffff" />
                <path d="M18 18h8v8h-8zM74 18h8v8h-8zM18 74h8v8h-8z" fill="#8B0000" />
                <rect x="42" y="10" width="6" height="6" fill="#1a365d" />
                <rect x="52" y="10" width="6" height="14" fill="#1a365d" />
                <rect x="42" y="24" width="14" height="6" fill="#1a365d" />
                <rect x="10" y="42" width="14" height="6" fill="#1a365d" />
                <rect x="30" y="42" width="6" height="14" fill="#1a365d" />
                <rect x="42" y="42" width="16" height="16" fill="#8B0000" rx="2" />
                <circle cx="50" cy="50" r="4" fill="#FFD700" />
                <rect x="66" y="42" width="14" height="6" fill="#1a365d" />
                <rect x="74" y="52" width="16" height="6" fill="#1a365d" />
                <rect x="42" y="66" width="6" height="24" fill="#1a365d" />
                <rect x="52" y="74" width="14" height="6" fill="#1a365d" />
                <rect x="70" y="66" width="20" height="24" fill="#1a365d" rx="2" />
              </svg>
            </div>

            <div className="text-[11px] font-black text-[#8B0000] mb-4 uppercase">
              HÒM THƯ SỐ • CÔNG AN XÃ ĐỨC HỢP
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                {copiedLink ? 'Đã chép link' : 'Sao chép link'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2 rounded-lg bg-[#8B0000] hover:bg-[#700000] text-white text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
