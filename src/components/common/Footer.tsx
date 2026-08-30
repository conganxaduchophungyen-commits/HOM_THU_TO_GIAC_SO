import React from 'react';
import { Shield, Phone, Mail, MapPin, CheckCircle2, Lock, Users } from 'lucide-react';
import { DUC_HOP_COMMUNE_INFO, DUC_HOP_VILLAGES } from '../../constants/policeData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2d3748] text-gray-300 border-t-4 border-[#FFD700] pt-8 pb-6 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Col 1: Unit Info */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#8B0000] border border-[#FFD700] flex items-center justify-center font-black text-white text-xs">
                CA
              </div>
              <div>
                <h4 className="font-black text-white text-xs sm:text-sm uppercase tracking-wide">
                  {DUC_HOP_COMMUNE_INFO.unitTitle}
                </h4>
                <p className="text-[11px] text-[#FFD700] font-semibold">{DUC_HOP_COMMUNE_INFO.provinceTitle}</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Hệ thống tiếp nhận, xử lý tin báo, tố giác tội phạm và phản ánh về an ninh trật tự trực tuyến 24/7.
              Phục vụ nhân dân và bảo đảm trật tự an toàn xã hội trên địa bàn 11 thôn.
            </p>
            <div className="flex items-center gap-2 pt-0.5 text-[11px] text-emerald-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Bảo mật danh tính người cung cấp thông tin tuyệt đối</span>
            </div>
          </div>

          {/* Col 2: Leadership Directory */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#FFD700] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-600 pb-1">
              <Users className="w-4 h-4" /> Ban Chỉ huy Công An Xã
            </h4>
            <ul className="space-y-1.5 text-[11px] text-gray-300">
              <li>
                <span className="text-white font-semibold">Thượng tá Đoàn Ngọc Quang</span> - Trưởng CAX
                <div className="text-[#FFD700] font-mono">SĐT: 0983.892.222</div>
              </li>
              <li>
                <span className="text-white font-semibold">Thiếu tá Phạm Văn Hài</span> - Phó CAX (PCTP)
                <div className="text-[#FFD700] font-mono">SĐT: 0986.106.548</div>
              </li>
              <li>
                <span className="text-white font-semibold">Trung tá Đặng Hồng Ngọc</span> - Phó CAX (Tổng hợp)
                <div className="text-[#FFD700] font-mono">SĐT: 0944.061.666</div>
              </li>
              <li>
                <span className="text-white font-semibold">Trung tá Vũ Văn Thu</span> - Phó CAX (CSTT)
                <div className="text-[#FFD700] font-mono">SĐT: 0988.178.118</div>
              </li>
            </ul>
          </div>

          {/* Col 3: 11 Villages */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#FFD700] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-600 pb-1">
              <MapPin className="w-4 h-4" /> Địa bàn 11 Thôn
            </h4>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-300">
              {DUC_HOP_VILLAGES.map((v, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]"></span>
                  <span>Thôn {v}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 italic pt-1">
              * Theo địa giới hành chính mới: Công an xã Đức Hợp trực thuộc Công an tỉnh Hưng Yên.
            </p>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#FFD700] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-600 pb-1">
              <Phone className="w-4 h-4" /> Trụ sở & Liên hệ trực ban
            </h4>
            <div className="space-y-1.5 text-[11px] text-gray-300">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-[#8B0000] flex-shrink-0 mt-0.5" />
                <span>{DUC_HOP_COMMUNE_INFO.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                <span className="text-white font-bold font-mono">Trực ban: 02213.815.999 (24/7)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                <span className="text-gray-300 break-all">{DUC_HOP_COMMUNE_INFO.notificationEmail}</span>
              </div>
              <div className="pt-1">
                <div className="p-2 rounded bg-[#1a202c] border border-gray-600 text-[10px] text-gray-400">
                  <span className="text-[#FFD700] font-semibold block mb-0.5">Tiếp nhận & Xử lý:</span>
                  Mọi tin báo, phản ánh đều được lập hồ sơ, phân loại và xử lý theo đúng quy định pháp luật.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* High Density Bottom Bar */}
        <div className="border-t border-gray-700 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} {DUC_HOP_COMMUNE_INFO.unitTitle} - {DUC_HOP_COMMUNE_INFO.provinceTitle}. Bản quyền thuộc cơ quan Công an.</p>
          <div className="flex items-center gap-4 text-[#FFD700]">
            <span>Hệ thống Tiếp nhận & Quản lý Hồ sơ v2.6</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
