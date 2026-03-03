package com.sellerhelper.portal.controller;

import com.sellerhelper.portal.service.DemoUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Profile("local")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class DemoUserController {

    private final DemoUserService demoUserService;

    @PostMapping("/demo")
    public ResponseEntity<Map<String, Object>> createDemoUsers() {
        int count = demoUserService.createDemoUsers(10);
        return ResponseEntity.ok(Map.of("created", count, "message", count + " demo user(s) created."));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetUsersExceptAdmin() {
        int count = demoUserService.resetUsersExceptAdmin();
        return ResponseEntity.ok(Map.of("deleted", count, "message", count + " user(s) reset (excluding admin)."));
    }
}
