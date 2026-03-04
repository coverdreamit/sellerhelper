package com.sellerhelper.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** 프론트엔드에서 사용할 앱 설정 (dev-mode: 랜덤 데이터 버튼 등 개발용 UI 노출 여부) */
@RestController
@RequestMapping("/api/app")
public class AppConfigController {

    @Value("${app.dev-mode:false}")
    private boolean devMode;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(Map.of("devMode", devMode));
    }
}
