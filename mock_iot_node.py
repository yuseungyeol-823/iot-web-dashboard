#!/usr/bin/env python3
import json
import random
import time
import urllib.request
import urllib.error

# Server configuration
BASE_URL = "http://localhost:8080"
CONFIG_URL = f"{BASE_URL}/api/admin/config"
UPDATE_URL = f"{BASE_URL}/api/seats/update"

# Local cache for seats and synchronized config
seats = {}  # key: "01".."48", value: "empty" | "occupied" | "away"
away_timeout_mins = 15  # Default sync parameter
sensitivity = "High"     # Default sync parameter

# Initialize 48 seats
for i in range(1, 49):
    seat_id = f"{i:02d}"
    seats[seat_id] = "empty"

def get_remote_config():
    """Fetch remote AI configurations from Spring Boot backend to sync parameters."""
    global away_timeout_mins, sensitivity
    try:
        req = urllib.request.Request(CONFIG_URL, method="GET")
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                new_timeout = data.get("awayTimeout", 15)
                new_sensitivity = data.get("sensitivity", "High")
                
                if new_timeout != away_timeout_mins or new_sensitivity != sensitivity:
                    print(f"🔄 [SYNC] 원격 AI 감지 임계 동기화: 부재 기준 {away_timeout_mins}분 ➡️ {new_timeout}분 | 감도 {sensitivity} ➡️ {new_sensitivity}")
                    away_timeout_mins = new_timeout
                    sensitivity = new_sensitivity
    except Exception as e:
        print(f"⚠️ [WARN] 원격 설정 동기화 실패 (서버 연결 대기 중...): {e}")

def update_seat_state(seat_id, status, remaining_time=None):
    """POST status updates to backend server."""
    payload = {
        "seatId": seat_id,
        "status": status,
        "remainingTime": remaining_time
    }
    headers = {"Content-Type": "application/json"}
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(UPDATE_URL, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data
    except Exception as e:
        print(f"❌ [ERROR] {seat_id}번 좌석 상태 변경 송신 실패: {e}")
    return None

print("=========================================================")
print("📡 AetherSpace 임베디드 라즈베리파이 YOLOv8 센서 노드 시뮬레이터")
print("=========================================================")
print(f"연결 서버: {BASE_URL}")
print("원격 감지 파라미터 동기화 및 3초 간격 실시간 텔레메트리 전송을 개시합니다.")
print("중단하려면 Ctrl+C를 입력하십시오.\n")

last_config_sync = 0

try:
    while True:
        now = time.time()
        
        # Poll remote AI configuration sync every 5 seconds
        if now - last_config_sync >= 5:
            get_remote_config()
            last_config_sync = now
            
        # Select a random seat to trip state transition
        rand_idx = random.randint(1, 48)
        seat_id = f"{rand_idx:02d}"
        current_status = seats[seat_id]
        
        # Transition rules: empty -> occupied -> away -> empty
        if current_status == "empty":
            next_status = "occupied"
            remaining = None
        elif current_status == "occupied":
            next_status = "away"
            remaining = away_timeout_mins * 60  # Synchronized with remote configuration in seconds
        else:
            next_status = "empty"
            remaining = None
            
        # Perform network POST transmission
        response = update_seat_state(seat_id, next_status, remaining)
        if response and response.get("status") == "SUCCESS":
            seats[seat_id] = next_status
            timer_text = f" (부재 타이머: {away_timeout_mins}분)" if next_status == "away" else ""
            print(f"📶 [YOLOv8 노드 감지] 좌석 S-{seat_id}: {current_status} ➡️ {next_status}{timer_text} 상태 전송 완료")
            
        # Telemetry cycle interval (3 seconds)
        time.sleep(3)
except KeyboardInterrupt:
    print("\n👋 시뮬레이터 프로그램이 사용자에 의해 중단되었습니다.")
