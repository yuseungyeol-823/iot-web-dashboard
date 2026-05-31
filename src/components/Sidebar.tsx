/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  TrendingUp, 
  Sliders, 
  Lock, 
  Terminal, 
  HelpCircle, 
  LogOut, 
  Database 
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  onTriggerAuthAlert: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  terminalOpen,
  setTerminalOpen,
  isAuthenticated,
  onTriggerAuthAlert
}: SidebarProps) {
  
  const handleNavigation = (view: string) => {
    // If not authenticated and trying to access anything other than gateway, show alert
    if (!isAuthenticated && view !== 'gateway') {
      onTriggerAuthAlert();
      onViewChange('gateway');
    } else {
      onViewChange(view);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-[#090d16] border-r border-slate-800/80 shadow-2xl flex flex-col pt-20 pb-8 transition-transform duration-300 text-slate-200">
      {/* Node Online Status Panel */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="w-10 h-10 rounded-full bg-blue-950/45 border border-blue-800/60 flex items-center justify-center text-blue-405">
            <Database size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="text-slate-250 font-bold text-sm">관제 노드 01</p>
            <p className="text-blue-400 text-[10px] uppercase tracking-widest font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              시스템 정상 가동 중
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {isAuthenticated && (
          <>
            <button
              onClick={() => handleNavigation('monitoring')}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                currentView === 'monitoring'
                  ? 'bg-blue-600/15 text-blue-405 border-l-4 border-blue-550 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-medium">실시간 좌석 현황</span>
            </button>

            <button
              onClick={() => handleNavigation('analytics')}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                currentView === 'analytics'
                  ? 'bg-blue-600/15 text-blue-405 border-l-4 border-blue-550 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40'
              }`}
            >
              <TrendingUp size={18} />
              <span className="text-sm font-medium">공간 이용 통계</span>
            </button>

            <button
              onClick={() => handleNavigation('configuration')}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                currentView === 'configuration'
                  ? 'bg-blue-600/15 text-blue-405 border-l-4 border-blue-550 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40'
              }`}
            >
              <Sliders size={18} />
              <span className="text-sm font-medium">감지 & 반납 설정</span>
            </button>
          </>
        )}

        <button
          onClick={() => handleNavigation('gateway')}
          className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-all duration-300 cursor-pointer ${
            currentView === 'gateway'
              ? 'bg-blue-600/15 text-blue-405 border-l-4 border-blue-550 font-semibold'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40'
          }`}
        >
          <Lock size={18} />
          <span className="text-sm font-medium">관리자 인증</span>
        </button>
      </nav>

      <div className="mt-auto px-4 space-y-2">
        {isAuthenticated && (
          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={`w-full py-2.5 rounded-lg text-xs font-bold font-mono tracking-wide uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
              terminalOpen 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'bg-slate-900 text-slate-350 hover:bg-slate-800'
            }`}
          >
            <Terminal size={14} />
            실시간 로그 터미널 {terminalOpen ? '닫기' : '열기'}
          </button>
        )}

        {isAuthenticated && (
          <div className="pt-2 border-t border-slate-850">
            <button
              onClick={() => {
                if (confirm("정말 로그아웃 하시겠습니까?")) {
                  window.location.reload();
                }
              }}
              className="w-full text-left text-rose-450 hover:text-rose-400 px-4 py-2 flex items-center gap-3 text-xs tracking-wide rounded-lg transition-colors hover:bg-rose-950/20"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
