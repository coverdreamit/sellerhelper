package com.sellerhelper.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** 프론트엔드 앱 설정 (portal 프로필) */
@Profile({"portal", "local"})
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
