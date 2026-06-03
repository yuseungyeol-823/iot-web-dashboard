/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  AlertTriangle, 
  Play, 
  Pause,
  RefreshCw,
  Video
} from 'lucide-react';

interface ConfigurationViewProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
  sensingParams: {
    awayTimeout: number;
    sensitivity: 'Low' | 'Medium' | 'High';
    streamUrl: string;
  };
  onUpdateParams: (awayTimeout: number, sensitivity: 'Low' | 'Medium' | 'High', streamUrl: string) => void;
}

export default function ConfigurationView({ onAddLog, sensingParams, onUpdateParams }: ConfigurationViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  // Initial local state for params mirroring parent
  const [localTimeout, setLocalTimeout] = useState(sensingParams.awayTimeout);
  const [localSensitivity, setLocalSensitivity] = useState(sensingParams.sensitivity);
  const [localStreamUrl, setLocalStreamUrl] = useState(sensingParams.streamUrl);

  // Sync local states if parent config state changes (asynchronous fetching)
  useEffect(() => {
    setLocalTimeout(sensingParams.awayTimeout);
    setLocalSensitivity(sensingParams.sensitivity);
    setLocalStreamUrl(sensingParams.streamUrl);
  }, [sensingParams]);

  // Keep live stopwatch updated
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + '.' + String(now.getMilliseconds()).padStart(3, '0'));
    }, 111);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateBackend = () => {
    onUpdateParams(localTimeout, localSensitivity, localStreamUrl);
    onAddLog(`⚙️ 카메라 설정 동기화: 스트림 URL 변경 완료 (${localStreamUrl || '기본값'})`, 'warning');
    alert("🚀 카메라 설정을 성공적으로 저장했습니다!");
  };

  const handleTimeoutSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTimeout(Number(e.target.value));
  };

  const handleSensitivityChange = (value: 'Low' | 'Medium' | 'High') => {
    setLocalSensitivity(value);
  };

  const handleStreamUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalStreamUrl(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-200">

      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="text-blue-500" size={24} />
            자동 반납 모듈 및 감지 센서 제어 설정
          </h1>
          <p className="text-xs text-slate-400 mt-1">IoT 센서 노드의 영상 스트리밍 분석 설정 및 자동 반납 파라미터를 제어합니다.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono select-none bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-slate-300 font-bold uppercase">CAM_04: 실시간 정상 가동 중</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: AI Camera Live Stream Preview Component */}
      <section className="glass-card hover:shadow-xl transition-shadow duration-500 rounded-2xl overflow-hidden relative group border border-slate-800/60">
        <div className="aspect-video w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
          
          <img 
            className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-85' : 'opacity-30'} grayscale-[0.2]`}
            alt="Corporate Surveillance Stream" 
            src={
              isPlaying 
                ? `http://${window.location.hostname}:8080/api/admin/config/video-stream?url=${encodeURIComponent(localStreamUrl || '')}` 
                : "https://lh3.googleusercontent.com/aida-public/AB6AXuDAL_DdWlgUbwbsrq-QMqkN1rbFez5J5h224UM5Wrdb0aG53EVWUbNE9bU-Wg_C8jXNVyeNeXe2ml6S9VQNvum_JJYWf7on_Q-OSZnGEH-eNZDjLm3T9sTO6bqsMyUfWKciOXz4PK42hbWRHCpqDK71rzJxpNXL8SNWtmsttKNjbug1xDKKRLfXL036_fBOoHMNeQGU_o8b-Hw0Fu1LF3Qe6cRt1xVFHAVlkPeKHyLZJBxpAnfnqcEucXO2onuLZFtH5D8N7iY0HQ"
            }
            referrerPolicy="no-referrer"
          />

          {/* CRT overlay line grid and beveled border */}
          <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-950/20 scanline"></div>

          {/* Blink red Live marker */}
          <div className="absolute top-4 left-4 bg-rose-600 border border-rose-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest flex items-center gap-2 select-none shadow">
            <span className={`w-2 h-2 bg-white rounded-full ${isPlaying ? 'animate-ping' : 'opacity-50'}`}></span>
            {isPlaying ? '실시간 비디오 분석 작동 중' : '수집 파이프라인 일시 정지됨'}
          </div>

          {/* Current system stopwatch time overlay */}
          <div className="absolute top-4 right-4 font-mono text-[10px] text-slate-300 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md">
            {currentTime || '2026-05-31 14:02:22.000'}
          </div>

          {/* Scanning glow effect bar */}
          {isPlaying && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan"></div>
          )}

          {/* Interaction mask - hover toggle overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 duration-300">
            <button 
              onClick={() => {
                setIsPlaying(!isPlaying);
                onAddLog(isPlaying ? "⚠️ CAM_04 카메라 채널이 관리자 명령에 의해 일시 정지되었습니다." : "📡 CAM_04 카메라 분석 노드가 정상적으로 시작되었습니다.", isPlaying ? 'warning' : 'success');
              }}
              className="w-16 h-16 rounded-full bg-slate-900/90 text-blue-500 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-2xl"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
            </button>
          </div>
        </div>
      </section>



      {/* SECTION 3: Camera Streaming Parameter Tuning Console */}
      <section className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800/60 shadow-lg space-y-8 relative overflow-hidden">
        
        {/* Decorative background glow elements */}
        <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
          <Video className="text-blue-500" size={20} />
          <h2 className="font-sans font-bold text-base text-slate-200">라즈베리파이 카메라 스트리밍 설정</h2>
        </div>

        <div className="space-y-8">
          
          {/* Selector 3: Streaming URL Input Field */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-350 flex items-center gap-2">
                <Video size={16} className="text-blue-500" />
                라즈베리파이 실시간 영상 스트리밍 주소 (MJPEG / RTSP)
              </label>
            </div>

            <input 
              type="text" 
              value={localStreamUrl}
              onChange={handleStreamUrlChange}
              placeholder="예: http://192.168.0.10:8000/stream.mjpg"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-slate-400 leading-relaxed pl-6 border-l border-slate-800">
              라즈베리파이 카메라가 YOLOv8 검지 영상을 퍼블리싱하는 영상 주소입니다. 공란으로 둘 경우 모형 데모용 고화질 오피스 라이브 카메라 주소로 대체 적용됩니다.
            </p>
          </div>

        </div>

        {/* Apply parameter propagation trigger panel */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-rose-350 bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-lg select-none font-medium">
            <AlertTriangle size={14} className="animate-pulse text-rose-500" />
            <span>주의: 설정을 저장하면 대시보드 및 실시간 관제 화면의 카메라 주소가 즉시 갱신됩니다.</span>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => {
                setLocalTimeout(sensingParams.awayTimeout);
                setLocalSensitivity(sensingParams.sensitivity);
                setLocalStreamUrl(sensingParams.streamUrl);
                onAddLog("♻️ 설정 변경사항이 취소되었습니다.", 'info');
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 bg-slate-900 cursor-pointer transition-colors border border-slate-800"
            >
              변경사항 취소
            </button>
            <button 
              onClick={handleUpdateBackend}
              className="px-7 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow"
            >
              <RefreshCw size={12} />
              설정 저장 및 동기화
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
