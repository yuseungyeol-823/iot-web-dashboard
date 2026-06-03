package com.example.occupancy.controller;

import com.example.occupancy.dto.SeatUpdateDto;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*") 
public class SeatController {

    // 🌟 48개 강제 초기화 삭제! 라즈베리파이가 등록한 실존 좌석만 담기는 동적 캐시 맵
    private final Map<String, SeatUpdateDto> seatsCache = new ConcurrentHashMap<>();
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    
    // 📡 마지막 텔레메트리 업데이트 수신 시각 (밀리초)
    private final AtomicLong lastTelemetryTime = new AtomicLong(System.currentTimeMillis());

    // ❌ 기존 public void init() 48개 루프 생성기 완전히 삭제 ❌

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSeats() {
        SseEmitter emitter = new SseEmitter(1800000L); // 30분 유지
        this.emitters.add(emitter);

        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));
        emitter.onError((e) -> this.emitters.remove(emitter));

        // 🌟 React 관제판이 켜지면, 현재까지 라즈베리파이로부터 빌드된 '진짜 존재하는 좌석들만' 선별 정렬해 전송
        try {
            List<SeatUpdateDto> allSeats = new ArrayList<>(seatsCache.values());
            allSeats.sort(Comparator.comparing(SeatUpdateDto::getSeatId));
            
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data(allSeats)); // 유동적인 알맹이 개수만 전송됨 (예: 2개 등록 시 2개만)
        } catch (IOException e) {
            emitter.completeWithError(e);
            this.emitters.remove(emitter);
        }

        return emitter;
    }

    @PostMapping("/update")
    public ResponseEntity<Map<String, Object>> updateSeat(@RequestBody SeatUpdateDto dto) {
        
        if (dto.getStatus() != null) {
            dto.setStatus(dto.getStatus().toLowerCase());
        }

        if (!"away".equalsIgnoreCase(dto.getStatus())) {
            dto.setRemainingTime(null);
        }

        // 📡 텔레메트리 전송 시각 갱신
        lastTelemetryTime.set(System.currentTimeMillis());

        // 🌟 라즈베리파이가 쏜 좌석 ID가 창고에 없었다면, 이 순간 메모리에 유동적으로 신규 생성 및 수용!
        seatsCache.put(dto.getSeatId(), dto);
        
        System.out.println(String.format("🔄 [동적 좌석 관제] 좌석 ID: %s ➡️ 상태: %s, 남은시간: %s초", 
                dto.getSeatId(), dto.getStatus(), dto.getRemainingTime()));

        // 브라우저 실시간 브로드캐스팅 푸시
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("seat-update")
                        .data(dto));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        if (!deadEmitters.isEmpty()) {
            this.emitters.removeAll(deadEmitters);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("synchronizedZone", dto.getSeatId());
        response.put("appliedStatus", dto.getStatus());

        return ResponseEntity.ok(response);
    }

    // 📡 12초 동안 라즈베리파이 센서/시뮬레이터 송신이 없으면 좌석 목록 초기화 (화면에서 비움)
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 3000)
    public void checkTelemetryTimeout() {
        if (!seatsCache.isEmpty() && (System.currentTimeMillis() - lastTelemetryTime.get() > 12000)) {
            System.out.println("⚠️ [텔레메트리 타임아웃] 라즈베리파이 오프라인 감지. 좌석 배치를 클리어합니다.");
            seatsCache.clear();
            
            // 모든 클라이언트에 빈 좌석 리스트 브로드캐스트하여 화면에서 숨김
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("init")
                            .data(new ArrayList<>()));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            if (!deadEmitters.isEmpty()) {
                this.emitters.removeAll(deadEmitters);
            }
        }
    }
}