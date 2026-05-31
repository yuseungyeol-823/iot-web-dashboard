package com.example.occupancy.controller;

import com.example.occupancy.dto.ConfigDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@RestController
@RequestMapping("/api/admin/config")
@CrossOrigin(origins = "*")
public class ConfigController {

    // Thread-safe in-memory store for AI remote configuration parameters.
    // Default config values: 15 minutes away timeout, High sensitivity.
    private static final AtomicReference<ConfigDto> globalConfig = new AtomicReference<>(
            new ConfigDto(15, "High")
    );

    @GetMapping
    public ResponseEntity<ConfigDto> getConfig() {
        return ResponseEntity.ok(globalConfig.get());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody ConfigDto newConfig) {
        // Validation check for safety
        if (newConfig.getAwayTimeout() == null) {
            newConfig.setAwayTimeout(15);
        }
        if (newConfig.getSensitivity() == null) {
            newConfig.setSensitivity("High");
        }

        globalConfig.set(newConfig);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "AI 감지 원격 설정이 변경되었습니다.");
        response.put("awayTimeout", newConfig.getAwayTimeout());
        response.put("sensitivity", newConfig.getSensitivity());

        return ResponseEntity.ok(response);
    }
}
