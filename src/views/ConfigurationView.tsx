/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  Shield,
  Settings
} from 'lucide-react';

interface ConfigurationViewProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
  sensingParams: {
    awayTimeout: number;
    sensitivity: 'Low' | 'Medium' | 'High';
  };
  onUpdateParams: (awayTimeout: number, sensitivity: 'Low' | 'Medium' | 'High') => void;
}

export default function ConfigurationView({ onAddLog, sensingParams, onUpdateParams }: ConfigurationViewProps) {
  // Initial local state for params mirroring parent
  const [localTimeout, setLocalTimeout] = useState(sensingParams.awayTimeout);
  const [localSensitivity, setLocalSensitivity] = useState(sensingParams.sensitivity);

  const handleUpdateBackend = () => {
    onUpdateParams(localTimeout, localSensitivity);
    onAddLog(`⚙️ 감지 임계 설정 배포: 자동 반납 대기 시간 ${localTimeout}분, 감도 ${localSensitivity}으로 변경 완료`, 'warning');
    alert("🚀 설정을 성공적으로 저장했습니다! 변경된 설정이 실시간으로 배포되고 있습니다.");
  };

  const handleTimeoutSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTimeout(Number(e.target.value));
  };

  const handleSensitivityChange = (value: 'Low' | 'Medium' | 'High') => {
    setLocalSensitivity(value);
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
          <p className="text-xs text-slate-400 mt-1">IoT 센서 노드의 장기 부재 판단을 위한 자동 반납 임계 시간 및 감도를 원격으로 설정합니다.</p>
        </div>
      </div>

      {/* SECTION: Premium Parameter Tuning Console Card */}
      <section className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800/60 shadow-lg space-y-8 relative overflow-hidden">
        
        {/* Decorative background glow elements */}
        <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -left-24 -top-24 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
          <SlidersHorizontal className="text-blue-500" size={20} />
          <h2 className="font-sans font-bold text-base text-slate-200">자동 반납 제어 콘솔</h2>
        </div>

        <div className="space-y-8">
          
          {/* Slider 1: Away Timeout */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-350 flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                자리비움 자동 반납 기준 시간 (부재 대기 시간)
              </label>
              <span className="font-mono text-xs font-bold text-blue-400 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 shadow-inner">
                {localTimeout}분
              </span>
            </div>
            
            <div className="relative pt-2">
              <input 
                type="range" 
                min="5" 
                max="30"
                value={localTimeout}
                onChange={handleTimeoutSliderChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                <span>최소 5분</span>
                <span>기본 15분</span>
                <span>최대 30분</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-6 border-l border-slate-800">
              특정 좌석에 센서 감지가 멈췄을 때, 시스템이 해당 자리를 강제로 **'이용 가능(AVAILABLE)'** 상태로 해제 및 자동 반납하기 전까지 유지되는 대기 시간입니다.
            </p>
          </div>

          {/* Selector 2: Sensor Sensitivity */}
          <div className="space-y-4 pt-4 border-t border-slate-800/40">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-350 flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" />
                IoT 센서 감지 감도 설정 (오감지 필터링)
              </label>
              <span className="font-mono text-xs font-bold text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-inner">
                {localSensitivity}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(['Low', 'Medium', 'High'] as const).map((level) => {
                const isSelected = localSensitivity === level;
                let activeStyle = '';
                if (level === 'Low') activeStyle = isSelected ? 'bg-slate-800 border-slate-600 text-slate-300 shadow-md' : 'border-slate-800 hover:border-slate-700 text-slate-500';
                if (level === 'Medium') activeStyle = isSelected ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md' : 'border-slate-800 hover:border-slate-750 text-slate-500';
                if (level === 'High') activeStyle = isSelected ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md' : 'border-slate-800 hover:border-slate-750 text-slate-500';

                return (
                  <button
                    key={level}
                    onClick={() => handleSensitivityChange(level)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${activeStyle}`}
                  >
                    {level === 'Low' && '낮음 (Low)'}
                    {level === 'Medium' && '보통 (Medium)'}
                    {level === 'High' && '높음 (High)'}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-6 border-l border-slate-800">
              미세한 움직임이나 먼지, 빛 반사 등으로 인한 오감지를 방지합니다. **'높음(High)'**으로 갈수록 즉각적인 상태 감지가 가능하나 오감지 확률이 상승할 수 있습니다.
            </p>
          </div>

        </div>

        {/* Apply parameter propagation trigger panel */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-rose-350 bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-lg select-none font-medium">
            <AlertTriangle size={14} className="animate-pulse text-rose-500" />
            <span>주의: 설정을 동기화하면 연결된 모든 IoT 센서 노드에 3초 이내에 실시간 배포됩니다.</span>
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
