package com.sellerhelper.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** 헬스체크 - 포털/커머스/프로덕션 모두 (nginx upstream, FE 배너용) */
@Profile({"portal", "commerce", "local", "prod"})
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "sellerhelper-be"));
    }
}
