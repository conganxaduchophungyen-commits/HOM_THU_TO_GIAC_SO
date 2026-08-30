import React from 'react';
import { Shield, PhoneCall, AlertTriangle, UserCheck, Code, FileText, Home, Search, HelpCircle, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { OfficerUser } from '../../types';
import { DUC_HOP_COMMUNE_INFO } from '../../constants/policeData';

interface HeaderProps {
  currentTab: 'home' | 'submit' | 'track' | 'guide' | 'officer' | 'gas_center';
  onSelectTab: (tab: 'home' | 'submit' | 'track' | 'guide' | 'officer' | 'gas_center') => void;
  currentUser: OfficerUser | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenLoginModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#8B0000] text-white shadow-md border-b-4 border-[#FFD700]">
      {/* Main High Density Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
          {/* Logo Crest & Unit Titles */}
          <div
            id="brand-header"
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-3.5 cursor-pointer group select-none"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center border-2 border-[#FFD700] shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
              <div className="text-[#8B0000] font-black text-xl sm:text-2xl flex items-center justify-center">
                CA
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-none uppercase text-white group-hover:text-[#FFD700] transition-colors">
                Hòm Thư Tố Giác Tội Phạm Số
              </h1>
              <p className="text-[#FFD700] font-semibold text-xs sm:text-sm lg:text-base tracking-wide uppercase mt-1">
                {DUC_HOP_COMMUNE_INFO.unitTitle} • {DUC_HOP_COMMUNE_INFO.provinceTitle}
              </p>
            </div>
          </div>

          {/* Hotline & Auth Status Section */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="text-right hidden md:block">
              <div className="text-xs uppercase font-semibold text-white/90 tracking-wider">
                Trực ban 24/7
              </div>
              <a
                href="tel:02213815999"
                className="text-xl lg:text-2xl font-black text-[#FFD700] hover:underline tracking-tight block font-mono"
              >
                02213.815.999
              </a>
            </div>

            {/* Officer Login / Status */}
            <div className="flex items-center space-x-2">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    id="btn-officer-portal"
                    onClick={() => onSelectTab('officer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                      currentTab === 'officer'
                        ? 'bg-[#FFD700] text-[#8B0000]'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-[#FFD700]" />
                    <span className="max-w-[120px] truncate">{currentUser.fullName}</span>
                  </button>
                  <button
                    id="btn-logout"
                    onClick={onLogout}
                    title="Đăng xuất"
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-login-open"
                  onClick={onOpenLoginModal}
                  className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#1a365d] text-white hover:bg-[#152c4d] border border-white/20 flex items-center gap-1.5 shadow transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-[#FFD700]" />
                  <span>Cán bộ</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* High Density Nav Bar */}
        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between overflow-x-auto gap-2">
          <nav className="flex items-center space-x-1.5 text-xs font-bold">
            <button
              id="nav-home"
              onClick={() => onSelectTab('home')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap uppercase tracking-wider ${
                currentTab === 'home'
                  ? 'bg-white text-[#8B0000] shadow-sm font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" /> Trang chủ
            </button>
            <button
              id="nav-submit"
              onClick={() => onSelectTab('submit')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap uppercase tracking-wider ${
                currentTab === 'submit'
                  ? 'bg-[#FFD700] text-[#8B0000] shadow-sm font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-[#FFD700]" /> Gửi tố giác / Phản ánh
            </button>
            <button
              id="nav-track"
              onClick={() => onSelectTab('track')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap uppercase tracking-wider ${
                currentTab === 'track'
                  ? 'bg-[#1a365d] text-white shadow-sm font-black border border-white/30'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 text-cyan-300" /> Tra cứu hồ sơ
            </button>
            <button
              id="nav-guide"
              onClick={() => onSelectTab('guide')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap uppercase tracking-wider ${
                currentTab === 'guide'
                  ? 'bg-white text-[#8B0000] shadow-sm font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" /> Hướng dẫn
            </button>
            <button
              id="nav-gas"
              onClick={() => onSelectTab('gas_center')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap uppercase tracking-wider ${
                currentTab === 'gas_center'
                  ? 'bg-slate-900 text-[#FFD700] shadow-sm font-black border border-white/20'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4 text-emerald-400" /> Mã nguồn GAS & Test
            </button>
          </nav>

          <div className="md:hidden text-xs font-bold text-[#FFD700] whitespace-nowrap flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5" /> 02213.815.999
          </div>
        </div>
      </div>
    </header>
  );
};
