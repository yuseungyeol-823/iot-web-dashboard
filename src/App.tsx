/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import SystemLogTerminal from './components/SystemLogTerminal';
import MonitoringView from './views/MonitoringView';
import ConfigurationView from './views/ConfigurationView';
import AnalyticsView from './views/AnalyticsView';
import GatewayView from './views/GatewayView';
import { Seat, LogMessage } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('gateway');
  const [terminalOpen, setTerminalOpen] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authAlertActive, setAuthAlertActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Core global state logic: sensing rules parameters
  const [sensingParams, setSensingParams] = useState({
    awayTimeout: 15,
    sensitivity: 'High' as 'Low' | 'Medium' | 'High'
  });

  // 2. State setup: 48 Seat maps list structure initialization
  const [seats, setSeats] = useState<Seat[]>(() => {
    const list: Seat[] = [];
    for (let i = 1; i <= 48; i++) {
      const id = `S-${String(i).padStart(2, '0')}`;
      
      // Default configurations similar to original design mockup
      let status: 'AVAILABLE' | 'OCCUPIED' | 'AWAY' = 'AVAILABLE';
      let timer: number | undefined;

      if (i === 5 || i === 12 || i === 28) {
        status = 'AWAY';
        timer = 582; // 9min 42s
      } else if (i % 4 === 0) {
        status = 'OCCUPIED';
      }

      list.push({
        id,
        status,
        timer,
        maxTimer: 582
      });
    }
    return list;
  });

  // 3. State Setup: Terminal system logs history
  const [logs, setLogs] = useState<LogMessage[]>(() => {
    const defaultLogs: LogMessage[] = [
      { id: '1', timestamp: '14:20:00', message: '에테르스페이스 관제 시스템 코어 초기화 중...', type: 'info' },
      { id: '2', timestamp: '14:20:02', message: 'SSE 프로토콜 연결 완료 [AES-256 보안 통신]', type: 'success' },
      { id: '3', timestamp: '14:20:05', message: '관리 노드 01 링크 수립 완료: 채널 알파 온라인', type: 'success' },
      { id: '4', timestamp: '14:21:45', message: '좌석 S-02: 이용 가능 → 사용 중 (포지션 센서 움직임 감지)', type: 'info' },
      { id: '5', timestamp: '14:21:52', message: '좌석 S-14: 이용 가능 → 사용 중 (포지션 센서 움직임 감지)', type: 'info' },
      { id: '6', timestamp: '14:22:01', message: '좌석 S-05: 사용 중 → 자리 비움 (부재 감지 타이머 활성화)', type: 'warning' },
      { id: '7', timestamp: '14:22:15', message: '좌석 S-33: 이용 가능 → 사용 중 (포지션 센서 움직임 감지)', type: 'info' },
      { id: '8', timestamp: '14:23:02', message: '좌석 S-01: 이용 가능 → 사용 중 (포지션 센서 움직임 감지)', type: 'info' },
      { id: '9', timestamp: '14:23:45', message: '좌석 S-12: 사용 중 → 자리 비움 (부재 감지 타이머 활성화)', type: 'warning' },
      { id: '10', timestamp: '14:24:10', message: '좌석 S-09: 이용 가능 → 사용 중 (포지션 센서 움직임 감지)', type: 'info' },
      { id: '11', timestamp: '14:25:33', message: '시스템 환경 안전 규격 검증 완료: 정상 작동 중', type: 'success' },
      { id: '12', timestamp: '14:26:01', message: '좌석 S-28: 사용 중 → 자리 비움 (부재 감지 타이머 활성화)', type: 'warning' }
    ];
    return defaultLogs;
  });

  // Helper function: adding logs with appropriate timing wrapper
  const addLog = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const newLog: LogMessage = {
      id: String(Date.now() + Math.random()),
      timestamp,
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Update secure parameters globally
  const handleUpdateParams = (awayTimeout: number, sensitivity: 'Low' | 'Medium' | 'High') => {
    setSensingParams({ awayTimeout, sensitivity });
  };

  // 4. Real-time Away timers countdown tick loops (Every Second)
  useEffect(() => {
    const timerTick = setInterval(() => {
      setSeats(prevSeats => {
        let changed = false;
        const nextSeats = prevSeats.map(seat => {
          if (seat.status === 'AWAY' && seat.timer !== undefined) {
            changed = true;
            const nextSec = seat.timer - 1;
            
            if (nextSec <= 0) {
              // Timer expired - revert to available states under FSM rules
              setTimeout(() => {
                addLog(`⚙️ FSM 자동 정리 완료: ${seat.id} 구역 '자리 비움'이 연장 없이 종료되어 '이용 가능' 상태로 오토-리셋되었습니다.`, 'success');
              }, 50);
              return {
                ...seat,
                status: 'AVAILABLE' as const,
                timer: undefined
              };
            }
            return {
              ...seat,
              timer: nextSec
            };
          }
          return seat;
        });
        return changed ? nextSeats : prevSeats;
      });
    }, 1000);

    return () => clearInterval(timerTick);
  }, [addLog]);

  // 5. Automated low-frequency random sensor heartbeat simulator (Every 35 seconds)
  useEffect(() => {
    const heartbeat = setInterval(() => {
      // Pick a random seat to trip state for high density simulation
      const randIdx = Math.floor(Math.random() * 48);
      setSeats(prevSeats => {
        const nextSeats = [...prevSeats];
        const target = nextSeats[randIdx];

        if (target.status === 'AVAILABLE') {
          target.status = 'OCCUPIED';
          addLog(`📡 시스템 텔레메트리: ${target.id} 구역이 '이용 가능'에서 '사용 중' 상태로 자동 전환되었습니다.`, 'info');
        } else if (target.status === 'OCCUPIED') {
          target.status = 'AWAY';
          target.timer = 582; // 9:42 reset
          addLog(`⚠️ 부재 감지 알림: ${target.id} 구역 모션 부재 감지 - '자리 비움' 허용 타이머가 시작되었습니다.`, 'warning');
        } else if (target.status === 'AWAY') {
          target.status = 'AVAILABLE';
          target.timer = undefined;
          addLog(`♻️ 센서 강제 동기화: ${target.id} 구역의 '자리 비움' 홀딩이 수동 리셋되어 '이용 가능' 상태로 반환되었습니다.`, 'success');
        }
        return nextSeats;
      });
    }, 35000);

    return () => clearInterval(heartbeat);
  }, [addLog]);

  // Update specific seat states via manual Administrator overrides
  const handleUpdateSeat = (seatId: string, newStatus: 'AVAILABLE' | 'OCCUPIED' | 'AWAY') => {
    setSeats(prevSeats => {
      return prevSeats.map(seat => {
        if (seat.id === seatId) {
          const prevStatus = seat.status;
          
          let prevLabel = '이용 가능';
          if (prevStatus === 'OCCUPIED') prevLabel = '사용 중';
          if (prevStatus === 'AWAY') prevLabel = '자리 비움';

          let nextLabel = '이용 가능';
          if (newStatus === 'OCCUPIED') nextLabel = '사용 중';
          if (newStatus === 'AWAY') nextLabel = '자리 비움';

          // Log changes in terminal
          const label = `⚙️ 관리자 오버라이드: ${seatId}의 원격 상태를 수동 변경했습니다. (${prevLabel} → ${nextLabel})`;
          let logType: 'info' | 'success' | 'warning' = 'info';
          if (newStatus === 'AVAILABLE') logType = 'success';
          if (newStatus === 'AWAY') logType = 'warning';
          
          addLog(label, logType);

          return {
            ...seat,
            status: newStatus,
            timer: newStatus === 'AWAY' ? 582 : undefined // reset default min
          };
        }
        return seat;
      });
    });
  };

  const handleTriggerAuthAlert = () => {
    setAuthAlertActive(true);
    addLog("🔒 접근 차단 알림: 비인가 접근 경로 감지로 인해 관리자 라우터 가드가 활성화되었습니다.", "alert");
  };

  const handleClearLogs = () => {
    setLogs([
      { id: String(Date.now()), timestamp: new Date().toTimeString().split(' ')[0], message: '시스템 이벤트 로그 콘솔 화면을 정돈했습니다 — 실시간 추적 대기 중...', type: 'info' }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans antialiased selection:bg-blue-500/30">
      
      {/* Background noise wallpaper visual styling */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/double-bubble-outline.png')" }}></div>

      {/* Top Header Panel Navigation */}
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onSearch={setSearchQuery} 
      />

      {/* Left side controller navigation drawer link */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        terminalOpen={terminalOpen}
        setTerminalOpen={setTerminalOpen}
        isAuthenticated={isAuthenticated}
        onTriggerAuthAlert={handleTriggerAuthAlert}
      />

      {/* Main layout contents area wrapper */}
      <main className={`transition-all duration-300 pt-20 pb-12 pl-72 ${(terminalOpen && isAuthenticated) ? 'pr-88' : 'pr-8'}`}>
        <div className="max-w-[1440px] mx-auto px-6 animate-fade-in">
          
          {currentView === 'monitoring' && (
            <MonitoringView 
              seats={seats} 
              onUpdateSeat={handleUpdateSeat} 
              searchQuery={searchQuery}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView 
              onAddLog={addLog} 
            />
          )}

          {currentView === 'configuration' && (
            <ConfigurationView 
              onAddLog={addLog}
              sensingParams={sensingParams}
              onUpdateParams={handleUpdateParams}
            />
          )}

          {currentView === 'gateway' && (
            <GatewayView 
              isAuthenticated={isAuthenticated}
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                setAuthAlertActive(false);
                setCurrentView('monitoring');
              }}
              authAlertActive={authAlertActive}
              onDismissAuthAlert={() => setAuthAlertActive(false)}
              onAddLog={addLog}
            />
          )}

        </div>
      </main>

      {/* Right side system scrolling logger console */}
      {terminalOpen && isAuthenticated && (
        <SystemLogTerminal 
          logs={logs} 
          onClearLogs={handleClearLogs}
        />
      )}

    </div>
  );
}

