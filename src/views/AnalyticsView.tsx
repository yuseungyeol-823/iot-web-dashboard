/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Calendar, 
  ShieldAlert,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { NoShowRecord } from '../types';

interface AnalyticsViewProps {
  onAddLog: (message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
  records: NoShowRecord[];
}

export default function AnalyticsView({ onAddLog, records }: AnalyticsViewProps) {

  // Dynamic records passed via props

  return (
    <div className="space-y-6 text-slate-200">

      {/* Date Filters and Header Action bar */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="text-blue-500" size={24} />
            장기 부재 좌석 자동 반납 이력
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            실시간 물리 센서의 미사용 부재 감지를 통해 자동 반납 처리된 좌석의 이력을 투명하게 모니터링합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900/80 rounded-xl px-4 py-2 border border-slate-800 flex items-center gap-3 text-slate-300 shadow-inner">
            <Calendar size={14} className="text-blue-405" />
            <span className="text-xs font-semibold">실시간 자동 반납 시스템 가동 중</span>
          </div>
        </div>
      </header>

      {/* Bento Grid Design Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SECTION 1: System Swipe No-Show Logs Tables Area - Expanded to Full Width */}
        <section className="lg:col-span-12 glass-card rounded-2xl overflow-hidden border border-slate-800/60 shadow-lg">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500 animate-pulse" />
                자동 반납 모니터링 & 상태 이력
              </h2>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                안전한 비수집 보안 정책에 따라 개인정보를 수집하지 않으며, 오직 좌석 ID별로 상태 정보만을 기재합니다.
              </p>
            </div>
            <div className="flex justify-end select-none">
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block animate-pulse"></span>
                오늘의 자동 반납 건수: {records.filter(r => r.status === 'Released').length}건
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-slate-300">
              <thead>
                <tr className="bg-slate-950/40 text-left border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">대상 좌석 ID</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">마지막 움직임 감지</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">자리비움 경과 비율</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">처리 및 제어 액션</th>
                  <th className="px-6 py-4 text-right text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">상세 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm font-semibold">
                      현재 기록된 자동 반납 이력이 없습니다. 센서 신호를 기다리는 중...
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    let mappedAction = "자동 반납 처리";
                    if (r.actionTaken === "FSM_FORCE_EXIT") mappedAction = "좌석 자동 해제 (완료)";
                    if (r.actionTaken === "NOTIFY_SENT") mappedAction = "반납 유예 알림 경보";

                    return (
                      <tr key={r.id} className="hover:bg-slate-900/40 transition-all duration-200">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-mono font-bold text-blue-400 text-sm shadow-inner">
                            {r.seatNode}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-200">좌석 {r.seatNode}</div>
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">YOLOv8 IoT IoT-Node</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{r.lastMotion}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                              <div 
                                className={`h-full ${r.idleProgress === 100 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'} transition-all`}
                                style={{ width: `${r.idleProgress}%` }}
                              ></div>
                            </div>
                            <span className={`text-[10px] font-mono font-semibold ${r.idleProgress === 100 ? 'text-rose-400' : 'text-amber-400'}`}>
                              {r.limitText}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-900/80 text-slate-350 px-2.5 py-1 rounded-md text-[10px] font-mono border border-slate-800 shadow-sm flex items-center gap-1.5 w-fit">
                            <ArrowRight size={10} className="text-blue-400" />
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>



      </div>

    </div>
  );
}
