package com.sellerhelper.controller;

import com.sellerhelper.dto.auth.LoginResponse;
import com.sellerhelper.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 API - JWT 방식.
 * 로그인/회원가입/로그아웃은 Portal 서버(/api/auth/*) 사용.
 * 이 서버는 /me 만 제공 (토큰으로 현재 사용자 정보 반환).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** 현재 로그인 사용자 조회 (Authorization: Bearer 토큰 필요) */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me() {
        LoginResponse user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }
}
