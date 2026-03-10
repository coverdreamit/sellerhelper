package com.sellerhelper.controller;

import com.sellerhelper.dto.auth.LoginRequest;
import com.sellerhelper.dto.auth.LoginResponse;
import com.sellerhelper.dto.auth.RegisterRequest;
import com.sellerhelper.dto.auth.RegisterResponse;
import com.sellerhelper.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/** 인증 API - JWT 발급 (portal 프로필, local 개발 시에도 활성화) */
@Profile({"portal", "local"})
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login 요청 수신 loginId={}", request != null ? request.getLoginId() : null);
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me() {
        LoginResponse user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
