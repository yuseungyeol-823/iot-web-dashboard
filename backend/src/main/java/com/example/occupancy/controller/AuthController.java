package com.example.occupancy.controller;

import com.example.occupancy.dto.LoginRequestDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequestDto loginDto) {
        Map<String, Object> response = new HashMap<>();

        // Simplify login verification with simple string matching for demonstration purposes.
        // Bypasses heavy JWT security checks to ensure latency stability in demoroom network.
        if ("root@aetherspace".equals(loginDto.getAdminId()) && "aetherspace2026".equals(loginDto.getPassword())) {
            response.put("status", "SUCCESS");
            response.put("token", "AES256-ACTIVE"); // Mock security token as requested in specs
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "FAIL");
            response.put("message", "비밀번호 혹은 아이디가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
