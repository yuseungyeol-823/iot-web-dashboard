package com.example.occupancy.controller;

import com.example.occupancy.dto.SeatUpdateDto;
import jakarta.annotation.PostConstruct;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
public class SeatController {

    private final Map<String, SeatUpdateDto> seatsCache = new ConcurrentHashMap<>();
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void init() {
        for (int i = 1; i <= 48; i++) {
            String seatId = String.format("%02d", i);
            seatsCache.put(seatId, new SeatUpdateDto(seatId, "empty", null));
        }
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSeats() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        // Immediately send current cached states to the newly connected React portal
        try {
            List<SeatUpdateDto> allSeats = new ArrayList<>(seatsCache.values());
            allSeats.sort(Comparator.comparing(SeatUpdateDto::getSeatId));
            
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data(allSeats));
        } catch (IOException e) {
            emitter.completeWithError(e);
            emitters.remove(emitter);
        }

        return emitter;
    }

    @PostMapping("/update")
    public ResponseEntity<Map<String, Object>> updateSeat(@RequestBody SeatUpdateDto dto) {
        // Enforce null remaining time if status is not "away"
        if (!"away".equalsIgnoreCase(dto.getStatus())) {
            dto.setRemainingTime(null);
        }

        // Update real-time in-memory cache
        seatsCache.put(dto.getSeatId(), dto);

        // Broadcast to all active browsers
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
        emitters.removeAll(deadEmitters);

        // Prepare spec-compliant response payload
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("synchronizedZone", dto.getSeatId());
        response.put("appliedStatus", dto.getStatus());

        return ResponseEntity.ok(response);
    }
}
