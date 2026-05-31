/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Crop, 
  Settings, 
  SlidersHorizontal, 
  AlertTriangle, 
  Play, 
  Pause,
  Plus,
  RefreshCw
} from 'lucide-react';
import { DetectionCluster } from '../types';

interface ConfigurationViewProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
  sensingParams: {
    awayTimeout: number;
    sensitivity: 'Low' | 'Medium' | 'High';
  };
  onUpdateParams: (awayTimeout: number, sensitivity: 'Low' | 'Medium' | 'High') => void;
}

export default function ConfigurationView({ onAddLog, sensingParams, onUpdateParams }: ConfigurationViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [coords, setCoords] = useState({ x: 482, y: 312 });
  const [draggedZone, setDraggedZone] = useState<string | null>(null);

  // Initial local state for params mirroring parent
  const [localTimeout, setLocalTimeout] = useState(sensingParams.awayTimeout);
  const [localSensitivity, setLocalSensitivity] = useState(sensingParams.sensitivity);

  const [clusters, setClusters] = useState<DetectionCluster[]>([
    { id: '1', name: '동측 집중형 벤치_클러스터', nodeIds: [102, 103, 104, 105] },
    { id: '2', name: '메인 업무용 라운지_01', nodeIds: [201, 202] },
    { id: '3', name: '대형 컨퍼런스룸_C1', nodeIds: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62] }
  ]);

  // Keep live stopwatch updated
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + '.' + String(now.getMilliseconds()).padStart(3, '0'));
    }, 111);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    // Scale tracking to pixels like 0 to 1920 / 1080 (optional mapping, let's keep simple relative)
    setCoords({ x, y });
  };

  const handleUpdateBackend = () => {
    onUpdateParams(localTimeout, localSensitivity);
    onAddLog(`⚙️ 감지 임계 설정 배포: 자동 반납 대기 시간 ${localTimeout}분으로 변경 완료`, 'warning');
    alert("🚀 설정을 성공적으로 저장했습니다! 변경된 설정이 실시간으로 배포되고 있습니다.");
  };

  const handleTimeoutSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTimeout(Number(e.target.value));
  };

  const handleSensitivitySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const text: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
    setLocalSensitivity(text[val - 1]);
  };

  const handleAddCluster = () => {
    const name = prompt("새로 등록할 감지 영역(ROI) 이름을 입력하세요 (예: 휴게실 바 테이블_하단):");
    if (name) {
      const nodeIdsString = prompt("해당 영역에 포함할 센서 노드(좌석) 번호 목록을 쉼표(,)로 구분해 입력하세요 (예: 301, 302):", "301, 302");
      const ids = nodeIdsString ? nodeIdsString.split(',').map(s => Number(s.trim())) : [];
      const newCluster: DetectionCluster = {
        id: String(Date.now()),
        name: name,
        nodeIds: ids
      };
      setClusters([...clusters, newCluster]);
      onAddLog(`➕ 신규 감지 영역 등록 완료: ${name} (포함 노드: [${ids.join(', ')}])`, 'info');
    }
  };

  return (
    <div className="space-y-6 text-slate-200">

      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">센서 감지 모듈 및 자동 반납 임계 설정</h1>
          <p className="text-xs text-slate-400 mt-0.5">AI 카메라 기반 실시간 감지 영역 설정 및 자동 반납 시간 제어 판넬입니다.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono select-none bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow"></span>
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAL_DdWlgUbwbsrq-QMqkN1rbFez5J5h224UM5Wrdb0aG53EVWUbNE9bU-Wg_C8jXNVyeNeXe2ml6S9VQNvum_JJYWf7on_Q-OSZnGEH-eNZDjLm3T9sTO6bqsMyUfWKciOXz4PK42hbWRHCpqDK71rzJxpNXL8SNWtmsttKNjbug1xDKKRLfXL036_fBOoHMNeQGU_o8b-Hw0Fu1LF3Qe6cRt1xVFHAVlkPeKHyLZJBxpAnfnqcEucXO2onuLZFtH5D8N7iY0HQ"
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
              className="w-16 h-16 rounded-full bg-slate-900/90 text-blue-405 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-2xl"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: ROI Remote Control Module Area */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Remote ROI Coordinate Calibration Panel */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-800/60 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-800">
            <h2 className="font-sans font-bold text-slate-200 flex items-center gap-2">
              <Crop className="text-blue-400" size={18} />
              CCTV 관심 영역(ROI) 감지 좌표 설정
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  onAddLog("♻️ CAM_04 카메라의 감지 영역 좌표를 기본값으로 초기화합니다...", 'info');
                  alert("감지 영역을 기본 좌표값으로 초기화합니다.");
                }}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-400 hover:bg-slate-850 cursor-pointer transition-colors"
              >
                초기화
              </button>
              <button 
                onClick={() => {
                  onAddLog("⚙️ 감지 구역 매핑 저장 완료: 변경된 영역 정보가 서버와 데이터베이스에 반영되었습니다.", 'success');
                  alert("관제 영역 좌표 설정이 성공적으로 저장 및 배포되었습니다.");
                }}
                className="px-3.5 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow hover:bg-blue-750 cursor-pointer active:scale-95 transition-all"
              >
                영역 설정 저장 (동기화)
              </button>
            </div>
          </div>

          {/* Architectural Overlay Viewport */}
          <div 
            onMouseMove={handleMouseMove}
            className="relative bg-slate-950 rounded-xl border border-slate-850 overflow-hidden cursor-crosshair group select-none"
          >
            <img 
              className="w-full aspect-[21/9] object-cover opacity-50 select-none pointer-events-none" 
              alt="Arch Layout Mapping" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSvwnQJR2EIjXgf864UI9BG-t3Kq1dK08oKH1ianjihQWte7hqPD4T0QBmkELeXMFxWDOEGb-zAJcGLmA_6Z1ZO_ifRVvMgQNGTQ1jF8SK1Iqsw74hJ3jo3qCuYOMWPQeo6gSe19eZQ_2ua2o5n7QUMjQUSifA1zOUjnarQ1dyIG_bIZHe67AWsRwB1hxkq8A_UDIWHYZ1ORBOnONwuMnHmeF0dQnX1XHmNU-7fhZSFA0bukQbnt2_nYRROPPwXHbW3YcqNuIsJQ"
              referrerPolicy="no-referrer"
            />

            {/* Static ROI Glowing Boxes on map */}
            <div className="absolute top-[18%] left-[12%] w-[15%] h-[28%] border-2 border-blue-500 bg-blue-500/10 flex flex-col justify-between p-1 shadow hover:scale-105 duration-300">
              <span className="font-mono text-[8px] text-blue-400 font-bold">오피스_Zone_A1 (640, 210)</span>
              <span className="font-mono text-[8px] text-blue-400 self-end font-bold">128x180 px</span>
            </div>

            <div className="absolute top-[22%] left-[34%] w-[15%] h-[28%] border-2 border-blue-500 bg-blue-500/10 flex flex-col justify-between p-1 shadow hover:scale-105 duration-300">
              <span className="font-mono text-[8px] text-blue-400 font-bold">휴게_Zone_A2 (840, 225)</span>
              <span className="font-mono text-[8px] text-blue-400 self-end font-bold">128x180 px</span>
            </div>

            <div className="absolute top-[52%] left-[55%] w-[18%] h-[32%] border-2 border-amber-500 bg-amber-500/10 flex flex-col justify-between p-1 shadow hover:scale-105 duration-300">
              <span className="font-mono text-[8px] text-amber-500 font-bold">임시 지정 구역_B (부재중 방지)</span>
              <span className="font-mono text-[8px] text-amber-500 self-end font-bold">160x192 px</span>
            </div>

            {/* Dot Grid overlay pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>

            {/* Simulated follows-the-mouse digital coordinate pointer */}
            <div className="absolute bottom-4 left-4 bg-slate-900/95 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-[10px] text-blue-400 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              현재 마우스 좌표 X: {coords.x}px | Y: {coords.y}px
            </div>
          </div>
        </div>

        {/* Remote Detection Clusters Table Panel */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 border border-slate-800/60 shadow-lg">
          <div>
            <h3 className="font-sans font-bold text-xs tracking-wider text-slate-350 uppercase pb-2 border-b border-slate-800 mb-3">
              구역별 센서 감지 영역(클러스터)
            </h3>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar w-full">
              {clusters.map((c) => (
                <div 
                  key={c.id} 
                  className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex justify-between items-center group hover:border-blue-500/50 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200 font-sans">{c.name}</p>
                    <p className="font-mono text-[10px] text-slate-500 mt-1">
                      귀속 노드 목록: [{c.nodeIds.join(', ')}]
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      onAddLog(`⚙️ [${c.name}] 클러스터 감지 영역 미세 조정 단계 진행`, 'info');
                      alert(`영역 [${c.name}]의 초점 및 감지 정합 설정을 조정합니다.`);
                    }}
                    className="text-slate-500 group-hover:text-blue-400 hover:rotate-90 transition-all duration-300 cursor-pointer"
                  >
                    <Settings size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAddCluster}
            className="w-full py-2 border-2 border-dashed border-slate-800 hover:border-blue-500 hover:text-blue-400 transition-colors rounded-xl text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer bg-slate-900/40"
          >
            <Plus size={14} /> 새 감지 구역(ROI) 등록
          </button>
        </div>
      </section>

      {/* SECTION 3: Sensitivity & Tuning Parameter Tuning Slider Console */}
      <section className="glass-card rounded-2xl p-6 border border-slate-800/60 shadow-lg space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <SlidersHorizontal className="text-blue-400" size={18} />
          <h2 className="font-sans font-bold text-base text-slate-200">좌석 감지 및 자동 반납 시간 제어</h2>
        </div>

        <div className="max-w-2xl mx-auto py-2">
          
          {/* Slider 1: Away Timeout */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                자리비움 자동 반납 기준 시간 (분)
              </label>
              <span className="font-mono text-xs font-bold text-blue-400 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                자리비움 {localTimeout}분
              </span>
            </div>
            
            <input 
              type="range" 
              min="5" 
              max="30"
              value={localTimeout}
              onChange={handleTimeoutSliderChange}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            
            <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
              <span>최소 5분</span>
              <span>기본 15분</span>
              <span>최대 30분</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              좌석에 움직임이 없을 때, 시스템이 해당 자리를 강제로 '이용 가능' 상태로 반납하기 전까지 '자리 비움' 상태를 유지해줄 대기 시간입니다.
            </p>
          </div>

        </div>

        {/* Apply parameter propagation trigger panel */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-rose-350 bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-lg select-none font-medium">
            <AlertTriangle size={14} className="animate-pulse text-rose-500" />
            <span>주의: 본 설정을 변경 및 배포하면 연결된 모든 카메라 및 실시간 관제 시스템에 60초 이내에 동기화됩니다.</span>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => {
                setLocalTimeout(sensingParams.awayTimeout);
                setLocalSensitivity(sensingParams.sensitivity);
                onAddLog("♻️ 설정 변경사항이 취소되었습니다.", 'info');
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 bg-slate-900 cursor-pointer transition-colors border border-slate-800"
            >
              변경사항 취소
            </button>
            <button 
              onClick={handleUpdateBackend}
              className="px-7 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1"
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
