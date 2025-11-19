package com.team9.imageplatform.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> health() {
        // NCP 로드밸런서/모니터링에서도 이 엔드포인트로 헬스체크 가능
        return Map.of(
                "status", "OK",
                "message", "Image Platform backend is running"
        );
    }
}
