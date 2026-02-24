package com.sellerhelper.controller;

import com.sellerhelper.service.DemoUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 개발 모드(local) 전용 - 데모 데이터 생성 API
 */
@Profile("local")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class DemoUserController {

    private final DemoUserService demoUserService;

    /** 랜덤 데모 사용자 10명 생성 */
    @PostMapping("/demo")
    public ResponseEntity<Map<String, Object>> createDemoUsers() {
        int count = demoUserService.createDemoUsers(10);
        return ResponseEntity.ok(Map.of("created", count, "message", count + " demo user(s) created."));
    }

    /** admin 제외 모든 사용자 초기화 */
    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetUsersExceptAdmin() {
        int count = demoUserService.resetUsersExceptAdmin();
        return ResponseEntity.ok(Map.of("deleted", count, "message", count + " user(s) reset (excluding admin)."));
    }
}
