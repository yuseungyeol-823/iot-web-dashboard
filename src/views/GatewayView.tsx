/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  UserSquare2, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  Timer, 
  Globe, 
  History 
} from 'lucide-react';

interface GatewayViewProps {
  isAuthenticated: boolean;
  onLoginSuccess: () => void;
  authAlertActive: boolean;
  onDismissAuthAlert: () => void;
  onAddLog: (message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

export default function GatewayView({
  isAuthenticated,
  onLoginSuccess,
  authAlertActive,
  onDismissAuthAlert,
  onAddLog
}: GatewayViewProps) {
  const [adminId, setAdminId] = useState('root@aetherspace');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    onAddLog(`🔑 관리자 로그인 정보 확인 중...`, 'info');

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess();
      onAddLog(`🟢 로그인 성공: 서버 접속 권한이 승인되었습니다. 반갑습니다, 관리자님.`, 'success');
      alert("🔒 로그인 완료! 실시간 데이터 모니터링 및 설정 대시보드로 이동합니다.");
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-6 px-4 md:px-0 text-slate-250">
      <div className="w-full max-w-[440px] flex flex-col items-center select-none">
        
        {/* Brand identity center top */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShieldCheck size={32} className="text-blue-400 animate-pulse-slow" />
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              AetherSpace 자원 관제소
            </h1>
          </div>
          <p className="text-xs text-slate-400">실시간 사내 자율 좌석 보호 및 유령 좌석 자동 반납 시스템</p>
        </div>

        {/* Central Auth Login Card */}
        <div className="glass-card w-full rounded-2xl overflow-hidden shadow-xl border border-slate-800/60 bg-slate-900/40 relative">
          
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-slate-100">관리자 인증 게이트웨이</h2>
            </div>

            {isAuthenticated ? (
              // Authenticated greeting
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-405 mx-auto animate-bounce">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">관리자 로그인 완료</h3>
                  <p className="text-xs text-slate-400 mt-1">접속 계정: {adminId}</p>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 text-xs text-emerald-400 font-mono select-text">
                  보안 세션 토큰: AES256-ACTIVE
                </div>
              </div>
            ) : (
              // Form Access
              <form onSubmit={handleLoginSubmit} className="space-y-5 shadow-sm">
                {/* Admin ID Field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    관리자 계정 ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <UserSquare2 size={16} />
                    </span>
                    <input 
                      type="text" 
                      required 
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-805 focus:border-blue-500 rounded-xl py-3 pl-12 pr-4 text-xs font-mono text-slate-205 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600"
                      placeholder="이메일 또는 ID 입력"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    관리자 비밀번호
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <Key size={16} />
                    </span>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-805 focus:border-blue-500 rounded-xl py-3 pl-12 pr-12 text-xs font-mono text-slate-205 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="••••••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm submit action */}
                <div className="pt-3 flex flex-col gap-4">
                  <button 
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-xs font-bold shadow hover:shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-transparent"
                  >
                    {isAuthenticating ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <>
                        <span>로그인 및 접속하기</span>
                        <Lock size={14} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        className="rounded border-slate-800 text-blue-500 focus:ring-blue-500/35 bg-slate-950" 
                      />
                      <span className="group-hover:text-slate-200 transition-colors">로그인 상태 유지</span>
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("초기 접속 계정 정보 안내:\n\n계정 ID: root@aetherspace\n임시 비밀번호: aetherspace2026"); }} className="hover:underline hover:text-blue-400">비밀번호 찾기</a>
                  </div>
                </div>
              </form>
            )}

          </div>

          {/* Decryption footer decoration */}
          <div className="bg-slate-950/80 px-6 py-4 border-t border-slate-850/80 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>보안 사양: AES-256 표준 보안 암호화</span>
            </div>
            <span>고유 노드 ID: 0x4F92</span>
          </div>

        </div>

        {/* Nav Router Guard Permission Denied Alert Card Popup */}
        {authAlertActive && (
          <div className="mt-6 w-full glass-card border border-rose-500/20 bg-rose-500/5 p-4 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-3 duration-500 shadow-lg relative">
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2 rounded-lg">
              <ShieldAlert size={20} className="animate-bounce" />
            </div>
            <div className="pr-6">
              <h3 className="text-xs font-bold text-rose-400">비인가 접근 감지 경보</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                접근 권한이 없습니다. 관리자 로그인을 완료한 후 다시 시도해 주세요.
              </p>
            </div>
            <button 
              onClick={onDismissAuthAlert}
              className="absolute top-3 right-3 text-rose-400 hover:text-rose-800 cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

      </div>

      {/* Decorative environment telemetry statistics bottom */}
      <footer className="w-full max-w-[440px] mt-10 pt-4 border-t border-slate-800/80 select-none opacity-60">
        <div className="flex flex-col gap-2.5 text-[10px] font-mono text-slate-500 tracking-wide font-medium">
          <div className="flex items-center gap-1.5 font-semibold">
            <History size={11} className="text-slate-500" />
            <span>최근 로그인 기록: 2026-06-01 00:10:15</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <Globe size={11} className="text-slate-500" />
            <span>현재 접속 감지된 사내 IP 주소: 192.168.1.104</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
