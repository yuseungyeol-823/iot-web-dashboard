/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Armchair, CheckCircle2, User, Timer, Trophy, ShieldAlert, MonitorPlay, Video, Play, Pause, RefreshCw } from 'lucide-react';
import { Seat, OccupancyStatus } from '../types';

interface MonitoringViewProps {
  seats: Seat[];
  onUpdateSeat: (seatId: string, newStatus: OccupancyStatus) => void;
  searchQuery: string;
  streamUrl: string;
}

export default function MonitoringView({ seats, onUpdateSeat, searchQuery, streamUrl }: MonitoringViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isError, setIsError] = useState(false);
  const [streamSrc, setStreamSrc] = useState('');

  const RASPBERRY_PI_PROXY_URL = `http://${window.location.hostname}:8080/api/admin/config/video-stream`;
  const FALLBACK_IMAGE = "https://placehold.co/640x480/1e293b/06b6d4?text=CAMERA+CONNECTING...";

  // Sync streamSrc when streamUrl changes
  useEffect(() => {
    setIsError(false);
    if (isPlaying) {
      setStreamSrc(`${RASPBERRY_PI_PROXY_URL}?url=${encodeURIComponent(streamUrl || '')}&t=${Date.now()}`);
    } else {
      setStreamSrc("https://lh3.googleusercontent.com/aida-public/AB6AXuDAL_DdWlgUbwbsrq-QMqkN1rbFez5J5h224UM5Wrdb0aG53EVWUbNE9bU-Wg_C8jXNVyeNeXe2ml6S9VQNvum_JJYWf7on_Q-OSZnGEH-eNZDjLm3T9sTO6bqsMyUfWKciOXz4PK42hbWRHCpqDK71rzJxpNXL8SNWtmsttKNjbug1xDKKRLfXL036_fBOoHMNeQGU_o8b-Hw0Fu1LF3Qe6cRt1xVFHAVlkPeKHyLZJBxpAnfnqcEucXO2onuLZFtH5D8N7iY0HQ");
    }
  }, [streamUrl, isPlaying]);

  const handleStreamError = () => {
    if (!isError) {
      setIsError(true);
      setStreamSrc(FALLBACK_IMAGE);
    }
  };

  const handleReload = () => {
    setIsError(false);
    setStreamSrc(`${RASPBERRY_PI_PROXY_URL}?url=${encodeURIComponent(streamUrl || '')}&t=${Date.now()}`);
  };
  // Mini simulation for network latency jitter
  const [latency, setLatency] = useState(12);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  useEffect(() => {
    const latInterval = setInterval(() => {
      setLatency(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return next >= 8 && next <= 16 ? next : prev;
      });
    }, 3000);
    return () => clearInterval(latInterval);
  }, []);

  // Filter seats based on query (e.g. S-05 or S-1)
  const filteredSeats = searchQuery
    ? seats.filter(s => s.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : seats;

  // Real-time calculations of telemetry
  const total = seats.length;
  const availableCount = seats.filter(s => s.status === 'AVAILABLE').length;
  const occupiedCount = seats.filter(s => s.status === 'OCCUPIED').length;
  const awayCount = seats.filter(s => s.status === 'AWAY').length;

  const availablePercent = total > 0 ? ((availableCount / total) * 100).toFixed(1) : '0.0';
  const occupiedPercent = total > 0 ? ((occupiedCount / total) * 100).toFixed(1) : '0.0';
  const awayPercent = total > 0 ? ((awayCount / total) * 100).toFixed(1) : '0.0';

  // Format time remaining
  const formatTime = (secs?: number) => {
    if (secs === undefined) return '09:42';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const changeStatus = (newStatus: OccupancyStatus) => {
    if (selectedSeat) {
      onUpdateSeat(selectedSeat.id, newStatus);
      setSelectedSeat(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* 1. Summary Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* TOTAL SEATS */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-lg">
          <span className="text-slate-400 font-bold text-xs tracking-wider uppercase font-sans">
            전체 관리 좌석
          </span>
          <span className="text-5xl font-extrabold text-slate-100 tracking-tight leading-none mt-1">
            {total}
          </span>
          <div className="absolute -right-4 -bottom-4 opacity-10 text-slate-400">
            <Armchair size={100} />
          </div>
        </div>

        {/* AVAILABLE */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border-l-4 border-emerald-500 shadow-lg">
          <span className="text-slate-400 font-bold text-xs tracking-wider uppercase font-sans">
            이용 가능 좌석
          </span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-5xl font-extrabold text-emerald-400 tracking-tight leading-none">
              {availableCount}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold mb-1">
              {availablePercent}%
            </span>
          </div>
        </div>

        {/* OCCUPIED */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border-l-4 border-rose-500 shadow-lg">
          <span className="text-slate-400 font-bold text-xs tracking-wider uppercase font-sans">
            사용 중인 좌석
          </span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-5xl font-extrabold text-rose-400 tracking-tight leading-none">
              {occupiedCount}
            </span>
            <span className="text-xs text-rose-400 font-mono font-bold mb-1">
              {occupiedPercent}%
            </span>
          </div>
        </div>

        {/* AWAY */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border-l-4 border-amber-500 shadow-lg">
          <span className="text-slate-400 font-bold text-xs tracking-wider uppercase font-sans">
            자리비움 좌석
          </span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-5xl font-extrabold text-amber-400 tracking-tight leading-none">
              {String(awayCount).padStart(2, '0')}
            </span>
            <span className="text-xs text-amber-500 font-mono font-bold mb-1">
              {awayPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Occupancy Flow Progress */}
      <div className="glass-card p-6 rounded-2xl space-y-4 shadow-lg border border-slate-800/80">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-sans font-bold text-lg text-slate-100">실시간 공간 점유 분포</h3>
            <p className="text-xs text-slate-400">물리 감지 센서 통합 모니터링</p>
          </div>
          <span className="font-mono text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-ping"></span>
            네트워크 지연율: {latency}ms
          </span>
        </div>

        {/* Tri-color Stacked Progress Bar */}
        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-850">
          <div 
            className="h-full bg-rose-500 transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]" 
            style={{ width: `${occupiedPercent}%` }}
            title={`사용 중: ${occupiedPercent}%`}
          ></div>
          <div 
            className="h-full bg-amber-500 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
            style={{ width: `${awayPercent}%` }}
            title={`자리 비움: ${awayPercent}%`}
          ></div>
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
            style={{ width: `${availablePercent}%` }}
            title={`이용 가능: ${availablePercent}%`}
          ></div>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm"></span>
            <span>사용 중 ({occupiedCount}석)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span>자리비움 (자동 반납 타이머 가동 중) ({awayCount}석)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
            <span>이용 가능 ({availableCount}석)</span>
          </div>
        </div>
      </div>

      {/* 3. Split-screen Layout: Left: Live CCTV / Right: Seats Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 📸 [좌측 5칸] 실시간 라즈베리파이 영상 스트리밍 보드 구역 */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-800/80 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isError ? "bg-amber-500" : "bg-red-500"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isError ? "bg-amber-500" : "bg-red-500"}`}></span>
                </span>
                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-sans">
                  {isError ? "CAM_04: 연결 해제됨" : "CAM_04: 실시간 관제 피드 (Live)"}
                </span>
              </div>
              
              <button 
                onClick={handleReload}
                className="text-[10px] px-2.5 py-1 bg-slate-900 hover:bg-blue-600/30 border border-slate-800 hover:border-blue-500 text-blue-400 hover:text-white rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} /> 카메라 연결 재시도
              </button>
            </div>

            <div 
              className="w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-850 shadow-inner flex items-center justify-center relative aspect-video"
            >
              <img
                src={streamSrc}
                alt="Raspberry Pi Space Feed"
                className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying && !isError ? 'opacity-85' : 'opacity-30'} grayscale-[0.1]`}
                onError={handleStreamError}
              />
              
              {/* Scanline CRT overlay */}
              <div className="absolute inset-0 pointer-events-none scanline"></div>

              {/* Interaction mask - hover toggle overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 duration-300">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-slate-900/90 text-blue-500 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-xl"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
                </button>
              </div>

              {!isError && isPlaying && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-[8px] text-blue-400 font-mono px-2 py-0.5 rounded border border-slate-800 select-none">
                  640 x 480 | 15 FPS | MJPEG
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed pl-3 border-l border-slate-800">
            * 라즈베리파이 YOLOv8 탐지 모델과 연동된 라이브 카메라 화면입니다. 자리비움이 15분 이상 유지될 경우 자동으로 반납 프로세스가 가동됩니다.
          </p>
        </div>

        {/* 🪑 [우측 7칸] 실시간 다이내믹 가상 좌석 현황 배치판 구역 */}
        <div className="lg:col-span-7 glass-card p-6 md:p-8 rounded-2xl flex flex-col gap-8 border border-slate-800/80 shadow-lg relative">
          
          {/* Podium/Screen Visual Area */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-3/4 h-2 bg-blue-900/30 rounded-full blur-md"></div>
            <div className="w-1/2 max-w-[300px] h-12 bg-slate-900/40 rounded-xl border border-slate-800/60 flex items-center justify-center relative shadow-sm">
              <div className="absolute -top-3 px-3 bg-blue-600 rounded-sm text-white font-bold text-[8px] tracking-widest uppercase">
                단상 및 메인 스크린 영역
              </div>
              <span className="text-slate-200 font-semibold text-[10px] tracking-wider flex items-center gap-1.5 font-mono uppercase">
                <MonitorPlay size={14} className="text-blue-400" /> 카메라 및 비디오 감지 구역
              </span>
            </div>
          </div>

          {/* Dynamic Seats Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 justify-items-center">
            {filteredSeats.map((seat) => {
              let statusColor = 'text-emerald-400 border-emerald-950 hover:border-emerald-500 bg-emerald-950/20';
              let iconComponent = <CheckCircle2 size={20} className="text-emerald-400" />;
              let statusLabel = '이용 가능';

              if (seat.status === 'OCCUPIED') {
                statusColor = 'text-rose-450 border-rose-950 hover:border-rose-500 bg-rose-950/20';
                iconComponent = <User size={20} className="text-rose-400 animate-pulse" />;
                statusLabel = '사용 중';
              } else if (seat.status === 'AWAY') {
                statusColor = 'text-amber-400 border-amber-500 hover:border-amber-500 bg-amber-950/30 animate-pulse';
                iconComponent = <Timer size={20} className="text-amber-400" />;
                statusLabel = '자리 비움';
              }

              return (
                <div
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={`group relative w-full aspect-square max-w-[80px] rounded-xl border ${statusColor} flex flex-col items-center justify-center p-2.5 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md overflow-hidden select-none`}
                >
                  {/* Seat name tag */}
                  <span className="absolute top-1.5 left-2 text-[8px] font-mono font-medium text-slate-450">
                    {seat.id}
                  </span>

                  {/* State Icon */}
                  <div className="mt-1 transition-transform group-hover:scale-110 duration-200">
                    {iconComponent}
                  </div>

                  {/* State Label */}
                  <span className="text-[8px] font-bold tracking-tight mt-1.5 uppercase opacity-80 font-sans">
                    {statusLabel}
                  </span>

                  {/* Away active countdown timer screen */}
                  {seat.status === 'AWAY' && (
                    <div className="absolute inset-0 bg-[#0c1424]/95 flex flex-col items-center justify-center transition-opacity duration-300">
                      <span className="text-[8px] font-bold font-mono tracking-wider text-amber-400 animate-pulse">
                        반납 대기
                      </span>
                      <span className="text-[10px] font-bold font-mono text-amber-400 mt-0.5">
                        {formatTime(seat.timer)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {seats.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center gap-2 select-none animate-pulse">
                <ShieldAlert size={36} className="opacity-60 text-blue-500" />
                <p className="text-sm font-bold text-slate-350">라즈베리파이 센서 데이터 연결 대기 중...</p>
                <p className="text-[10px] text-slate-500">실시간 YOLOv8 감지 장치 또는 시뮬레이터가 켜지면 좌석이 자동으로 배치도에 나타납니다.</p>
              </div>
            ) : filteredSeats.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center gap-2 select-none">
                <ShieldAlert size={30} className="opacity-40 text-slate-500" />
                <p className="text-xs font-semibold">검색 조건에 일치하는 좌석이 없습니다.</p>
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* Seat Detail Interaction Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="glass-card border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative animate-fade-in text-slate-100">
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4">
              좌석 상태 수동 변경 — {selectedSeat.id}
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              해당 좌석의 감지 상태를 수동으로 강제 변경합니다. 변경된 설정은 실시간으로 서버 및 대시보드 전체에 즉시 동기화됩니다.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => changeStatus('AVAILABLE')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 border transition-all ${
                  selectedSeat.status === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-900/30'
                    : 'bg-slate-900 text-emerald-400 border border-emerald-900/50 hover:bg-slate-850'
                }`}
              >
                <CheckCircle2 size={14} /> 이용 가능 상태로 변경
              </button>

              <button
                onClick={() => changeStatus('OCCUPIED')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 border transition-all ${
                  selectedSeat.status === 'OCCUPIED'
                    ? 'bg-rose-600 text-white border-transparent shadow-lg shadow-rose-900/30'
                    : 'bg-slate-900 text-rose-450 border border-rose-900/50 hover:bg-slate-850'
                }`}
              >
                <User size={14} /> 사용 중 상태로 변경
              </button>

              <button
                onClick={() => changeStatus('AWAY')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 border transition-all ${
                  selectedSeat.status === 'AWAY'
                    ? 'bg-amber-600 text-white border-transparent shadow-lg shadow-amber-900/30'
                    : 'bg-slate-900 text-amber-400 border border-amber-900/50 hover:bg-slate-850'
                }`}
              >
                <Timer size={14} /> 자리비움 상태로 변경 (타이머 작동)
              </button>
            </div>

            <button
              onClick={() => setSelectedSeat(null)}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-850 text-slate-350 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-slate-800"
            >
              변경 취소
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
