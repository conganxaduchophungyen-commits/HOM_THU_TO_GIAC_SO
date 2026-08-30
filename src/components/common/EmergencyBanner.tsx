import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, HeartPulse, Flame } from 'lucide-react';
import { DUC_HOP_COMMUNE_INFO } from '../../constants/policeData';

export const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-[#FFFDE7] border-l-4 border-[#FFD700] py-3.5 px-4 shadow-sm border-y border-amber-200/60">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start space-x-3 text-[#856404] max-w-3xl">
          <AlertOctagon className="w-6 h-6 text-[#8B0000] flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <div className="font-black text-sm uppercase tracking-wide text-[#8B0000] mb-0.5">
              Cảnh báo quan trọng:
            </div>
            <p className="text-[#856404] leading-relaxed text-xs sm:text-[13px]">
              Trong trường hợp khẩn cấp, nguy hiểm trực tiếp đến tính mạng hoặc tài sản, người dân cần liên hệ ngay
              cơ quan Công an qua số điện thoại trực ban <strong>02213.815.999</strong> hoặc <strong>113</strong>. Hệ thống trực tuyến không thay thế việc báo tin khẩn cấp trực tiếp.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          <a
            href="tel:02213815999"
            className="px-3.5 py-1.5 rounded-lg bg-[#8B0000] hover:bg-[#700000] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-transform active:scale-95 border border-[#FFD700]/50"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Trực ban: 02213.815.999</span>
          </a>
          <a
            href="tel:113"
            className="px-3 py-1.5 rounded-lg bg-[#1a365d] hover:bg-[#122540] text-white font-bold flex items-center gap-1 shadow-sm text-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> 113 Khẩn cấp
          </a>
          <a
            href="tel:114"
            className="px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold flex items-center gap-1 shadow-sm text-xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber-200" /> 114 Cứu hỏa
          </a>
          <a
            href="tel:115"
            className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center gap-1 shadow-sm text-xs"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-200" /> 115 Cấp cứu
          </a>
        </div>
      </div>
    </div>
  );
};
