/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Trash2, 
  UserCheck, 
  HelpCircle,
  Clock,
  Zap,
  Activity,
  UserX,
  Gauge
} from 'lucide-react';
import { NoShowRecord } from '../types';

interface AnalyticsViewProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

export default function AnalyticsView({ onAddLog }: AnalyticsViewProps) {
  const [fsmPulse, setFsmPulse] = useState(12);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Auto-decrement Next FSM Pulse countdown (live simulation loop)
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setFsmPulse(prev => {
        if (prev <= 1) {
          onAddLog("📡 정기 감지 스캔 완료: 48개 전체 구역의 좌석 자동 반납 스캔을 진행했습니다.", 'info');
          return 15; // reset parameter loop
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(pulseTimer);
  }, [onAddLog]);

  const [records, setRecords] = useState<NoShowRecord[]>([
    {
      id: '1',
      user: {
        name: 'Alex Chen',
        idTag: '#USR-2941',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPMXt1YhrULRFgkAC0vw493CE8cdZRwa8EhJ9o4vMucZdIJgHeVsKzIA26mK5BKu6H3xve4ZKSW_QXiT9jLgvqgAzaB7teOZno3yaZvkWL1mcRC-58HRbsI-G8a2I--UAzmP8Up6CZr5xordGu4m2-N0idOqMnuTr5IgUt2zZe4Mjg9eSzIeRZVMpX_tHzxTAj8ph2RhPIgQ0D5bPDhAUhdvpJbQ5TadfHk35MiPJUCLhMNDfxj2euXj7MOwfh8RAJQQRpqMFaOQ'
      },
      seatNode: 'NODE-42B',
      lastMotion: '14:22:10',
      idleProgress: 100,
      limitText: '15m 00s (Limit)',
      actionTaken: 'FSM_FORCE_EXIT',
      status: 'Released'
    },
    {
      id: '2',
      user: {
        name: 'Sarah Miller',
        idTag: '#USR-1088',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxEkJCRHXbiRKuL_97feoL2LhWmMUiavDpzCngYVuH_ZqCU12NzT-kr22rqT0lVbRel6pkzBVxNyMKPExd7M4pTKrmRO1VfbI4m7yRnBVHjPh6OTVUo4796b5zI6LDsRirVqgRZ3HyVAioOmWeMRfso74AEohVprYFAw8RW8lzgR9VA6nDfKrP6MSNL462AQQvAFLZMjTyMJIbD5ijKZ9r1SB5AjQXdxX-BDPjJ2ULM3c4t96FBw8yAMvwNP2wkSuMh2lB49qFfw'
      },
      seatNode: 'NODE-15A',
      lastMotion: '15:05:44',
      idleProgress: 100,
      limitText: '15m 00s (Limit)',
      actionTaken: 'FSM_FORCE_EXIT',
      status: 'Released'
    },
    {
      id: '3',
      user: {
        name: 'Marcus Thorne',
        idTag: '#USR-8821',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTNGmCyAXQbgep5-X0rhdTiPG7ca3wucCv3wILq2CmZxpKmHC5ZPLk_8H-jTfHsCO0JV4d5j9AG50W911SIQlVHVYyzZrGpLq4eCTY4O8QmIhbh4W5nMwLIPMjDr0IJoEqPoxGrGB5zYD7tbAgLtHQdyNVjjzb86-02NBymRia7phoa2-EjEg2GXNFoDjKKWR0d1w5-GpoPwC2F_07SYqxKV-93zA0_grKJgIA1ymztPE6anykmZWCl0vRL56he-kNZDFslM76rw'
      },
      seatNode: 'NODE-09C',
      lastMotion: '15:12:00',
      idleProgress: 68,
      limitText: '10m 14s (Warning)',
      actionTaken: 'NOTIFY_SENT',
      status: 'Active Grace'
    }
  ]);

  const handleExportCSV = () => {
    onAddLog("💾 CSV 데이터 추출 완료: 실시간 점유율 및 자동 반납 기록 파일이 저장되었습니다.", 'success');
    alert("🟢 시스템 통계 및 좌석 반납 이력이 'AETHER_SPATIAL_ANALYTICS.csv' 파일로 저장되었습니다.");
  };

  return (
    <div className="space-y-6 text-slate-200">

      {/* Date Filters and Action bar */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">공간 이용 분석 대시보드</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            실시간 좌석 점유 현황과 장기 미사용 구역의 회전율 통계입니다.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900/80 rounded-xl px-4 py-2 border border-slate-800 flex items-center gap-3 text-slate-300">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-xs font-semibold">최근 7일 데이터 기반</span>
          </div>
          <button 
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl border border-transparent flex items-center gap-2 cursor-pointer text-xs font-semibold transition-all active:scale-95 shadow"
          >
            <Download size={14} />
            CSV 로그 저장
          </button>
        </div>
      </header>

      {/* Bento Grid Design Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart A: Congestion Prime Time Line Path Map */}
        <section className="lg:col-span-8 glass-card rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[380px] border border-slate-800/60">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="text-blue-400" size={16} />
                  실시간 공간 점유율 추이
                </h2>
                <p className="text-[11px] text-slate-400">시간대별 실제 점유 트렌드와 예측 점유율 비교</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono leading-relaxed select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm"></span>
                  <span className="text-slate-400">모델 예측값</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                  <span className="text-slate-400">실시간 데이터</span>
                </div>
              </div>
            </div>

            {/* Custom high-fidelity responsive SVG line chart with grids & hovering interactive triggers */}
            <div className="h-56 w-full relative mt-4">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                <defs>
                  {/* Glowing gradient color mapping underneath curves */}
                  <linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid backdrop lines */}
                <line x1="0" y1="50" x2="800" y2="50" stroke="#334155" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#334155" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="#334155" strokeOpacity="0.3" strokeDasharray="3 3" />

                <line x1="133" y1="0" x2="133" y2="200" stroke="#334155" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="266" y1="0" x2="266" y2="200" stroke="#334155" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="400" y1="0" x2="400" y2="200" stroke="#334155" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="533" y1="0" x2="533" y2="200" stroke="#334155" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="666" y1="0" x2="666" y2="200" stroke="#334155" strokeOpacity="0.2" strokeDasharray="3 3" />

                {/* Dynamic Area sweep mapping */}
                <path 
                  d="M0,200 L0,140 C100,150 200,80 300,100 C400,120 500,40 600,60 C700,80 800,20 L800,200 Z" 
                  fill="url(#area-blue)" 
                />

                {/* Predicted solid sky-blue curve vector path */}
                <path 
                  d="M0,140 C100,150 200,80 300,100 C400,120 500,40 600,60 C700,80 800,20" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />

                {/* Actual dotted cozy-orange curve vector path */}
                <path 
                  d="M0,160 C100,140 200,110 300,130 C400,150 500,80 600,90 C700,110 800,60" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 6" 
                  strokeLinecap="round" 
                />

                {/* Interaction Hover Points mapping coordinates */}
                {[0, 133, 266, 400, 533, 666, 799].map((x, i) => (
                  <circle 
                    key={x} 
                    cx={x} 
                    cy={i === 0 ? 140 : i === 1 ? 148 : i === 2 ? 85 : i === 3 ? 104 : i === 4 ? 42 : i === 5 ? 65 : 20} 
                    r={hoveredPoint === i ? "6" : "3"} 
                    fill="#3b82f6" 
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              {/* Simulated hover guide bubble box */}
              {hoveredPoint !== null && (
                <div 
                  className="absolute p-2 bg-slate-900 border border-slate-800 text-white rounded-lg text-[10px] font-mono pointer-events-none shadow-2xl animate-fade-in"
                  style={{ 
                    left: `${(hoveredPoint * 14) + 2}%`, 
                    top: hoveredPoint > 3 ? '40%' : '15%'
                  }}
                >
                  <p className="font-bold text-blue-400">실시간 점유율 데이터</p>
                  <p className="text-white mt-0.5">예측 강도: {95 - (hoveredPoint * 7.5)}%</p>
                  <p className="text-amber-405">측정 수치: {90 - (hoveredPoint * 8)}%</p>
                </div>
              )}
            </div>

            {/* X-axis labels mapping timelines */}
            <div className="flex justify-between mt-3 text-[9px] font-mono font-medium text-slate-500 uppercase tracking-widest pl-1 pr-1">
              <span>08:00</span>
              <span>10:00</span>
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00</span>
              <span>18:00</span>
              <span>20:00</span>
            </div>
          </div>

          {/* Bottom Card Metas Summary Matrix */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-5">
            <div>
              <div className="text-slate-400 text-[9px] font-bold tracking-widest uppercase">최고 혼잡 점유율</div>
              <div className="text-xl font-mono font-bold text-slate-100 mt-0.5">88.4%</div>
            </div>
            <div>
              <div className="text-slate-400 text-[9px] font-bold tracking-widest uppercase font-sans">최고 혼잡 지속 시간</div>
              <div className="text-xl font-mono font-bold text-slate-100 mt-0.5">4시간 12분</div>
            </div>
            <div>
              <div className="text-slate-400 text-[9px] font-bold tracking-widest uppercase font-sans">실시간 혼잡 레벨</div>
              <div className="text-xl font-mono font-bold text-rose-450 mt-0.5 animate-pulse">정체 구간 (주의)</div>
            </div>
          </div>
        </section>

        {/* Chart B: Seat Turnover Ring Donut Area */}
        <section className="lg:col-span-4 glass-card rounded-2xl p-6 shadow-lg flex flex-col justify-between border border-slate-800/60 min-h-[380px]">
          <div>
            <h2 className="text-base font-bold text-slate-205 flex items-center gap-2 pb-1 border-b border-slate-800">
              <Zap className="text-amber-500" size={16} />
              좌석 사용 회전율 (Turnover)
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">각 구역별 실시간 좌석 순환 지표 통계입니다.</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              
              {/* Turn-over circular custom vector layout */}
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r="62" 
                  fill="transparent" 
                  stroke="#0f172a" 
                  strokeWidth="11" 
                />
                {/* Turquoise high-traffic circle segment */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r="62" 
                  fill="transparent" 
                  stroke="#3b82f6" 
                  strokeWidth="11" 
                  strokeDasharray="390" 
                  strokeDashoffset="110" 
                  strokeLinecap="round" 
                />
                {/* Orange low-efficiency circle segment */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r="62" 
                  fill="transparent" 
                  stroke="#f59e0b" 
                  strokeWidth="11" 
                  strokeDasharray="390" 
                  strokeDashoffset="280" 
                  strokeLinecap="round" 
                />
              </svg>

              {/* Metric values in center */}
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-bold font-sans tracking-tight text-slate-100 leading-none">2.4회</span>
                <span className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider mt-1.5 font-sans">
                  지정 좌석수<br />일일 평균 전환율
                </span>
              </div>
            </div>
          </div>

          {/* Metric list items */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-405">집중 근무 구역 (A구역)</span>
              </div>
              <span className="font-mono text-slate-200 font-semibold">72% 회전</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-405">라운지 및 휴게 구역 (C구역)</span>
              </div>
              <span className="font-mono text-slate-200 font-semibold">28% 회전</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: System Swipe No-Show Logs Tables Area */}
        <section className="lg:col-span-12 glass-card rounded-2xl overflow-hidden border border-slate-800/60 shadow-lg">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <UserX size={18} className="text-rose-455" />
                장기 부재 좌석 자동 반납 모니터링
              </h2>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                자리비움 허용 시간이 초과되어 자동 반납 처리된 좌석 목록입니다.
              </p>
            </div>
            <div className="flex justify-end select-none">
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block animate-pulse"></span>
                오늘의 자동 반납 건수: 12건
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-slate-300">
              <thead>
                <tr className="bg-slate-950/40 text-left border-b border-slate-800">
                  <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">사용자명 / 사원 ID</th>
                  <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">배정 노드(좌석)</th>
                  <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">마지막 움직임 감지</th>
                  <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">자리비움 경과 비율</th>
                  <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">처리 내용</th>
                  <th className="px-6 py-3 text-right text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {records.map((r) => {
                  let mappedAction = "자동 반납 처리";
                  if (r.actionTaken === "FSM_FORCE_EXIT") mappedAction = "자동 반납 완료";
                  if (r.actionTaken === "NOTIFY_SENT") mappedAction = "반납 경보 발송";

                  return (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition-all duration-200">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 overflow-hidden shadow-inner group">
                          <img 
                            alt="User micro avatar" 
                            className="w-full h-full object-cover group-hover:scale-110 duration-300 transition-transform" 
                            src={r.user.avatar} 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{r.user.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{r.user.idTag}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{r.seatNode}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{r.lastMotion}</td>
                      <td className="px-6 py-4">
                        <div className="w-28 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                          <div 
                            className={`h-full ${r.idleProgress === 100 ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'} transition-all`}
                            style={{ width: `${r.idleProgress}%` }}
                          ></div>
                        </div>
                        <span className={`text-[9px] font-mono mt-1 block font-semibold ${r.idleProgress === 100 ? 'text-rose-455' : 'text-blue-404'}`}>
                          {r.limitText.replace("15m 00s (Limit)", "15분 초과 (자동반납)").replace("10m 14s (Warning)", "10분 14초 (경고)")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-900/80 text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-mono border border-slate-800 uppercase shadow-sm">
                          {mappedAction}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {r.status === 'Released' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 uppercase tracking-widest font-sans">
                            ✔️ 반납 완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 uppercase tracking-widest font-sans">
                            ⚠️ 경고 진행 중
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Dynamic Micro-metrics grid footer */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 transition-colors p-4 rounded-xl shadow-sm select-none cursor-default">
            <div className="flex justify-between items-start mb-2">
              <Gauge size={16} className="text-blue-400" />
              <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md font-bold">+12%</span>
            </div>
            <div className="text-slate-500 text-[10px] font-bold tracking-wider uppercase font-sans">실시간 감지 반응속도</div>
            <div className="text-xl font-mono font-bold text-slate-200 mt-1">42ms</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition-colors p-4 rounded-xl shadow-sm select-none cursor-default">
            <div className="flex justify-between items-start mb-2">
              <UserX size={16} className="text-amber-500" />
              <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-bold">-4%</span>
            </div>
            <div className="text-slate-500 text-[10px] font-bold tracking-wider uppercase font-sans">좌석 부재중 발생률</div>
            <div className="text-xl font-mono font-bold text-slate-200 mt-1">평균 8.2%</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors p-4 rounded-xl shadow-sm select-none cursor-default">
            <div className="flex justify-between items-start mb-2">
              <Zap size={16} className="text-slate-400" />
              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-bold">정상 가동</span>
            </div>
            <div className="text-slate-500 text-[10px] font-bold tracking-wider uppercase font-sans">시스템 신뢰성 지수</div>
            <div className="text-xl font-mono font-bold text-slate-200 mt-1">99.4% 정상</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 transition-colors p-4 rounded-xl shadow-sm select-none cursor-default relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <Clock size={16} className="text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md font-bold animate-ping absolute top-4 right-4"></span>
              <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md font-bold">동작 중</span>
            </div>
            <div className="text-slate-500 text-[10px] font-bold tracking-wider uppercase font-sans">다음 자동 반납 정기 스캔</div>
            <div className="text-xl font-mono font-bold text-blue-404 mt-1 animate-pulse">{fsmPulse}초</div>
          </div>

        </div>

      </div>

    </div>
  );
}
