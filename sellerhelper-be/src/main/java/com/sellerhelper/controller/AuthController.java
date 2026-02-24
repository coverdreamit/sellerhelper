package com.sellerhelper.controller;

import com.sellerhelper.config.AuthUser;
import com.sellerhelper.dto.auth.LoginRequest;
import com.sellerhelper.dto.auth.LoginResponse;
import com.sellerhelper.dto.auth.RegisterRequest;
import com.sellerhelper.dto.auth.RegisterResponse;
import com.sellerhelper.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;

/** 인증(로그인/회원가입) API - 세션 방식 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** 로그인 - 성공 시 세션 생성 */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        LoginResponse res = authService.login(request);
        authService.establishSession(res, httpRequest);
        return ResponseEntity.ok(res);
    }

    /** 회원가입 - 승인 대기 상태로 등록 */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    /** 현재 로그인 사용자 조회 (세션) */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me() {
        LoginResponse user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    /** 로그아웃 - 세션 무효화 */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }
}
