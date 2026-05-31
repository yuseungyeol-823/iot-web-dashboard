/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';
import { LogMessage } from '../types';

interface SystemLogTerminalProps {
  logs: LogMessage[];
  onClearLogs?: () => void;
}

export default function SystemLogTerminal({ logs, onClearLogs }: SystemLogTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of system log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Dynamic calculated statics
  const packetCount = 4129 + logs.length * 3;
  const bufferValue = 1024 + Math.round(logs.length * 1.5);

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-80 bg-[#090d16] border-l border-slate-800/85 flex flex-col shadow-2xl z-30 transition-all duration-300">
      
      {/* Console Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0c1424] flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Active Status Pulse */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <h4 className="font-sans font-extrabold text-xs tracking-widest text-slate-200 uppercase">
            시스템 실시간 이벤트 로그
          </h4>
        </div>
        <button
          onClick={onClearLogs}
          title="콘솔 로그 초기화"
          className="text-slate-400 hover:text-blue-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <Terminal size={14} />
        </button>
      </div>

      {/* Terminal Grid Output */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-2 select-text custom-scrollbar bg-[#070b13]"
      >
        {logs.map((log) => {
          let colorClass = 'text-slate-400'; // Default info code
          if (log.type === 'success') colorClass = 'text-emerald-400 font-medium';
          if (log.type === 'warning') colorClass = 'text-amber-400';
          if (log.type === 'alert') colorClass = 'text-rose-450 font-bold';

          return (
            <div 
              key={log.id} 
              className={`${colorClass} leading-relaxed animate-fade-in break-words`}
            >
              <span className="opacity-50 select-none mr-1.5 font-sans text-slate-500">
                [{log.timestamp}]
              </span>
              {log.message}
            </div>
          );
        })}
        
        {/* Waiting for packets live blink cursor */}
        <div className="text-blue-400 flex items-center gap-1.5 animate-pulse font-mono mt-1.5">
          <span className="inline-block w-1.5 h-3 bg-blue-500 animate-bounce"></span>
          <span>&gt; 실시간 데이터 패킷 수신 대기 중...</span>
        </div>
      </div>

      {/* Hardware Analytics overlay footer */}
      <div className="p-4 bg-[#0c1424] border-t border-slate-800">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Shield size={10} className="text-blue-404" />
            버퍼 대기열: {bufferValue}KB
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw size={10} className="animate-spin-slow text-amber-500" />
            누적 패킷: {packetCount.toLocaleString()}
          </span>
        </div>
      </div>
    </aside>
  );
}
