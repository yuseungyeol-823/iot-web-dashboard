/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Radio, Bell, ShieldAlert, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
  onSearch: (query: string) => void;
  onActivateSensors?: () => void;
}

export default function Navbar({ isAuthenticated, onSearch, onActivateSensors }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(3);

  const notifications = [
    { id: 1, text: "좌석 S-05 상태가 [자리 비움]으로 조치되었습니다.", time: "2분 전", type: 'warning' },
    { id: 2, text: "관심 영역(ROI) 경계선 변경 정보가 수집되었습니다.", time: "15분 전", type: 'info' },
    { id: 3, text: "Alex Chen 사용자에 대한 자동 반납 처리가 수행되었습니다.", time: "40분 전", type: 'alert' }
  ];

  const handleSensorsClick = () => {
    if (onActivateSensors) {
      onActivateSensors();
    } else {
      alert("📡 공간 환경 센서 오토-캘리브레이션 활성화... 상태: 100% 정상 작동 중 (48개 수동 피드백 수신 완료)");
    }
  };

  return (
    <nav className="fixed top-0 right-0 left-64 z-50 bg-[#0d1527]/85 backdrop-blur-xl flex justify-between items-center h-16 px-8 border-b border-slate-800/60 shadow-lg text-slate-100">
      {/* Brand Identity / Left Section */}
      <div className="flex items-center gap-4">
        <span className="font-sans text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
            <div className="w-3 h-3 border border-white rounded-[2px]"></div>
          </div>
          AetherSpace Control
        </span>
        {isAuthenticated ? (
          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-405 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-450" />
            보안 관리자 연결됨
          </span>
        ) : (
          <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <ShieldAlert size={12} />
            인가되지 않은 접근
          </span>
        )}
      </div>

      {/* Interactive Right Section */}
      <div className="flex items-center gap-6">

        {/* Action Controls */}
        <div className="flex items-center gap-4 relative">
          <button
            onClick={handleSensorsClick}
            title="환경 센서 동기화"
            className="text-slate-400 hover:text-blue-500 hover:bg-slate-800/50 p-2 rounded-full cursor-pointer transition-colors duration-200"
          >
            <Radio size={18} className="animate-pulse text-blue-500" />
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setNotifCount(0);
              }}
              title="시스템 경고"
              className="text-slate-400 hover:text-blue-500 hover:bg-slate-800/50 p-2 rounded-full cursor-pointer transition-colors duration-200 relative"
            >
              <Bell size={18} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0d1527]"></span>
              )}
            </button>

            {/* Notifications Menu dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0e172a] border border-slate-800 rounded-xl shadow-2xl p-4 z-50 text-xs text-slate-200">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                  <span className="font-bold text-slate-200">시스템 실시간 알림</span>
                  <button onClick={() => setShowNotifications(false)} className="text-[10px] text-slate-450 hover:text-slate-350">닫기</button>
                </div>
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 bg-slate-900/60 hover:bg-slate-900 rounded-lg transition-colors border-l-2 border-amber-500">
                      <p className="text-slate-300 font-medium leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
