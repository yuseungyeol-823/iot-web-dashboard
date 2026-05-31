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
      { id: '1', timestamp: '14:20:00', message: 'AetherSpace 관제 시스템 초기화 중...', type: 'info' },
      { id: '2', timestamp: '14:20:02', message: '실시간(SSE) 데이터 연결 성공', type: 'success' },
      { id: '3', timestamp: '14:20:05', message: '관제 노드 01 연결 성공', type: 'success' },
      { id: '4', timestamp: '14:21:45', message: '좌석 S-02: 사용 중 감지 (움직임 감지)', type: 'info' },
      { id: '5', timestamp: '14:21:52', message: '좌석 S-14: 사용 중 감지 (움직임 감지)', type: 'info' },
      { id: '6', timestamp: '14:22:01', message: '좌석 S-05: 자리 비움 감지 (부재 타이머 작동)', type: 'warning' },
      { id: '7', timestamp: '14:22:15', message: '좌석 S-33: 사용 중 감지 (움직임 감지)', type: 'info' },
      { id: '8', timestamp: '14:23:02', message: '좌석 S-01: 사용 중 감지 (움직임 감지)', type: 'info' },
      { id: '9', timestamp: '14:23:45', message: '좌석 S-12: 자리 비움 감지 (부재 타이머 작동)', type: 'warning' },
      { id: '10', timestamp: '14:24:10', message: '좌석 S-09: 사용 중 감지 (움직임 감지)', type: 'info' },
      { id: '11', timestamp: '14:25:33', message: '시스템 상태 정상 작동 중', type: 'success' },
      { id: '12', timestamp: '14:26:01', message: '좌석 S-28: 자리 비움 감지 (부재 타이머 작동)', type: 'warning' }
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
    // Update all active AWAY seats' timers to the new timeout in seconds
    setSeats(prevSeats => {
      return prevSeats.map(seat => {
        if (seat.status === 'AWAY') {
          // Send update to backend to sync the new remaining time
          const numericId = seat.id.replace('S-', '');
          fetch(`http://${window.location.hostname}:8080/api/seats/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              seatId: numericId,
              status: 'away',
              remainingTime: awayTimeout * 60
            })
          }).catch(err => console.error('Failed to sync seat timer on parameter update:', err));

          return {
            ...seat,
            timer: awayTimeout * 60,
            maxTimer: awayTimeout * 60
          };
        }
        return seat;
      });
    });
  };

  // 3.5 Live Backend Integration: SSE Event Streaming Subscription
  useEffect(() => {
    addLog('📡 실시간(SSE) 데이터 동기화 연결 시도 중...', 'info');

    // Dynamically connect using current window hostname to ensure robustness in demo networking environments
    const eventSource = new EventSource(`http://${window.location.hostname}:8080/api/seats/stream`);

    eventSource.addEventListener('init', (event) => {
      try {
        const backendSeats = JSON.parse(event.data);
        setSeats(prevSeats => {
          return prevSeats.map(seat => {
            const numericId = seat.id.replace('S-', '');
            const match = backendSeats.find((bs: any) => bs.seatId === numericId);
            if (match) {
              const statusMap: Record<string, 'AVAILABLE' | 'OCCUPIED' | 'AWAY'> = {
                'empty': 'AVAILABLE',
                'occupied': 'OCCUPIED',
                'away': 'AWAY'
              };
              const nextStatus = statusMap[match.status] || 'AVAILABLE';
              return {
                ...seat,
                status: nextStatus,
                timer: match.remainingTime ?? undefined
              };
            }
            return seat;
          });
        });
        addLog(`🟢 실시간 연결 성공: 총 ${backendSeats.length}개 좌석 상태가 동기화되었습니다.`, 'success');
      } catch (err) {
        console.error('Error parsing init data:', err);
        addLog('❌ 데이터 파싱 실패: 데이터 구조 형식이 불일치합니다.', 'alert');
      }
    });

    eventSource.addEventListener('seat-update', (event) => {
      try {
        const updated = JSON.parse(event.data); // { seatId: "04", status: "away", remainingTime: 900 }
        const reactId = `S-${updated.seatId}`;

        setSeats(prevSeats => {
          let prevStatusLabel = '이용 가능';
          let nextStatusLabel = '이용 가능';
          let logType: 'info' | 'success' | 'warning' = 'info';

          const targetSeat = prevSeats.find(s => s.id === reactId);
          if (targetSeat) {
            const statusMapLabel: Record<string, string> = {
              'AVAILABLE': '이용 가능',
              'OCCUPIED': '사용 중',
              'AWAY': '자리 비움'
            };
            prevStatusLabel = statusMapLabel[targetSeat.status] || '이용 가능';
          }

          const statusMap: Record<string, 'AVAILABLE' | 'OCCUPIED' | 'AWAY'> = {
            'empty': 'AVAILABLE',
            'occupied': 'OCCUPIED',
            'away': 'AWAY'
          };
          const nextStatus = statusMap[updated.status] || 'AVAILABLE';

          if (nextStatus === 'AVAILABLE') {
            nextStatusLabel = '이용 가능';
            logType = 'success';
          } else if (nextStatus === 'OCCUPIED') {
            nextStatusLabel = '사용 중';
            logType = 'info';
          } else if (nextStatus === 'AWAY') {
            nextStatusLabel = '자리 비움';
            logType = 'warning';
          }

          // Build context-rich terminal system logs based on transition state
          let logMessage = '';
          if (nextStatus === 'AVAILABLE') {
            if (targetSeat?.status === 'AWAY') {
              logMessage = `⚙️ 자동 반납 완료: ${reactId} 좌석의 비움 시간이 만료되어 '이용 가능' 상태로 자동 전환되었습니다.`;
            } else {
              logMessage = `♻️ 수동 리셋 완료: ${reactId} 좌석을 '이용 가능' 상태로 강제 전환했습니다.`;
            }
          } else if (nextStatus === 'OCCUPIED') {
            logMessage = `좌석 ${reactId}: 사용 중 감지 (움직임 감지)`;
          } else if (nextStatus === 'AWAY') {
            const minutes = updated.remainingTime ? Math.floor(updated.remainingTime / 60) : 15;
            logMessage = `⚠️ 부재 감지 알림: ${reactId} 좌석에 움직임이 없습니다. 자리비움 타이머(${minutes}분)가 가동됩니다.`;
          }

          // Schedule logging on task queue to decouple from state update cycle
          setTimeout(() => {
            addLog(logMessage, logType);
          }, 0);

          return prevSeats.map(seat => {
            if (seat.id === reactId) {
              return {
                ...seat,
                status: nextStatus,
                timer: updated.remainingTime ?? undefined
              };
            }
            return seat;
          });
        });
      } catch (err) {
        console.error('Error parsing seat update data:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      addLog('🚨 서버 연결이 종료되었습니다. 실시간 채널 재연결을 시도합니다...', 'alert');
    };

    return () => {
      eventSource.close();
      addLog('🔌 실시간 관제 채널 연결 종료', 'info');
    };
  }, [addLog]);

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
              // Timer expired - trigger available reset event to backend
              const numericId = seat.id.replace('S-', '');
              fetch(`http://${window.location.hostname}:8080/api/seats/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  seatId: numericId,
                  status: 'empty',
                  remainingTime: null
                })
              }).catch(err => console.error('FSM timer auto-reset failed:', err));

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
  }, []);

  // 5. Simulated Raspberry Pi YOLOv8 / sensor telemetry heartbeat (Every 35 seconds)
  useEffect(() => {
    const heartbeat = setInterval(() => {
      // Pick a random seat to trip state for high density simulation
      const randIdx = Math.floor(Math.random() * 48);
      const seatIdStr = String(randIdx + 1).padStart(2, '0');
      const reactId = `S-${seatIdStr}`;

      setSeats(prevSeats => {
        const target = prevSeats.find(s => s.id === reactId);
        if (!target) return prevSeats;

        let nextBackendStatus = 'empty';
        let nextRemainingTime = null;

        if (target.status === 'AVAILABLE') {
          nextBackendStatus = 'occupied';
        } else if (target.status === 'OCCUPIED') {
          nextBackendStatus = 'away';
          nextRemainingTime = sensingParams.awayTimeout * 60;
        } else if (target.status === 'AWAY') {
          nextBackendStatus = 'empty';
        }

        // POST status update to backend, which triggers SSE broadcast to all subscribers
        fetch(`http://${window.location.hostname}:8080/api/seats/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seatId: seatIdStr,
            status: nextBackendStatus,
            remainingTime: nextRemainingTime
          })
        }).catch(err => console.error('Raspberry Pi heartbeat emulation update failed:', err));

        return prevSeats; // do not update state locally; let SSE stream broadcast handle state transition smoothly
      });
    }, 35000);

    return () => clearInterval(heartbeat);
  }, [sensingParams.awayTimeout]);

  // Update specific seat states via manual Administrator overrides calling the backend API
  const handleUpdateSeat = (seatId: string, newStatus: 'AVAILABLE' | 'OCCUPIED' | 'AWAY') => {
    const numericId = seatId.replace('S-', '');
    const backendStatus = newStatus === 'AVAILABLE' ? 'empty' : (newStatus === 'OCCUPIED' ? 'occupied' : 'away');
    const remainingTime = newStatus === 'AWAY' ? sensingParams.awayTimeout * 60 : null;

    fetch(`http://${window.location.hostname}:8080/api/seats/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        seatId: numericId,
        status: backendStatus,
        remainingTime: remainingTime
      })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to update seat status on backend cache');
      }
      return res.json();
    })
    .then(data => {
      console.log('Seat successfully overridden on backend:', data);
    })
    .catch(err => {
      console.error('Error overriding seat status:', err);
      addLog(`❌ 상태 변경 실패: ${seatId} 좌석의 원격 제어 도중 네트워크 통신 에러가 발생했습니다.`, 'alert');
    });
  };

  const handleTriggerAuthAlert = () => {
    setAuthAlertActive(true);
    addLog("🔒 접근 경고: 관리자 인증이 필요한 접근 경로입니다.", "alert");
  };

  const handleClearLogs = () => {
    setLogs([
      { id: String(Date.now()), timestamp: new Date().toTimeString().split(' ')[0], message: '시스템 로그 콘솔이 초기화되었습니다.', type: 'info' }
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

