package com.example.occupancy.controller;

import com.example.occupancy.dto.ConfigDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@RestController
@RequestMapping("/api/admin/config")
@CrossOrigin(origins = "*")
public class ConfigController {

    private static final String DEFAULT_STREAM_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDAL_DdWlgUbwbsrq-QMqkN1rbFez5J5h224UM5Wrdb0aG53EVWUbNE9bU-Wg_C8jXNVyeNeXe2ml6S9VQNvum_JJYWf7on_Q-OSZnGEH-eNZDjLm3T9sTO6bqsMyUfWKciOXz4PK42hbWRHCpqDK71rzJxpNXL8SNWtmsttKNjbug1xDKKRLfXL036_fBOoHMNeQGU_o8b-Hw0Fu1LF3Qe6cRt1xVFHAVlkPeKHyLZJBxpAnfnqcEucXO2onuLZFtH5D8N7iY0HQ";

    // Thread-safe in-memory store for AI remote configuration parameters.
    // Default config values: 15 minutes away timeout, High sensitivity, and default stream URL.
    private static final AtomicReference<ConfigDto> globalConfig = new AtomicReference<>(
            new ConfigDto(15, "High", DEFAULT_STREAM_URL)
    );

    @GetMapping
    public ResponseEntity<ConfigDto> getConfig() {
        return ResponseEntity.ok(globalConfig.get());
    }

    @GetMapping("/video-stream")
    public void getVideoStream(
            @RequestParam(value = "url", required = false) String urlParam,
            HttpServletResponse response) {
        
        String urlStr = urlParam;
        if (urlStr == null || urlStr.trim().isEmpty()) {
            urlStr = globalConfig.get().getStreamUrl();
        }
        
        if (urlStr == null || urlStr.trim().isEmpty() || urlStr.equals(DEFAULT_STREAM_URL)) {
            try {
                response.sendRedirect(DEFAULT_STREAM_URL);
            } catch (IOException e) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
            return;
        }

        if (urlStr.startsWith("https://lh3.googleusercontent.com") || urlStr.contains("googleusercontent.com")) {
            try {
                response.sendRedirect(urlStr);
            } catch (IOException e) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
            return;
        }

        HttpURLConnection connection = null;
        try {
            URL url = URI.create(urlStr).toURL();
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(10000);

            String contentType = connection.getContentType();
            if (contentType != null) {
                response.setContentType(contentType);
            } else {
                response.setContentType("multipart/x-mixed-replace; boundary=frame");
            }

            try (InputStream inputStream = connection.getInputStream();
                 OutputStream outputStream = response.getOutputStream()) {
                byte[] buffer = new byte[16384];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                    outputStream.flush();
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to proxy video stream: " + e.getMessage());
            try {
                response.sendRedirect(DEFAULT_STREAM_URL);
            } catch (IOException ioException) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
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
        if (newConfig.getStreamUrl() == null || newConfig.getStreamUrl().trim().isEmpty()) {
            newConfig.setStreamUrl(DEFAULT_STREAM_URL);
        }

        globalConfig.set(newConfig);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "AI 감지 원격 설정 및 스트리밍 URL이 변경되었습니다.");
        response.put("awayTimeout", newConfig.getAwayTimeout());
        response.put("sensitivity", newConfig.getSensitivity());
        response.put("streamUrl", newConfig.getStreamUrl());

        return ResponseEntity.ok(response);
    }
}
