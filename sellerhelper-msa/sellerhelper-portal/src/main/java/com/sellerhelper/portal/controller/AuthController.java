package com.sellerhelper.portal.controller;

import com.sellerhelper.portal.dto.auth.LoginRequest;
import com.sellerhelper.portal.dto.auth.LoginResponse;
import com.sellerhelper.portal.dto.auth.RegisterRequest;
import com.sellerhelper.portal.dto.auth.RegisterResponse;
import com.sellerhelper.portal.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** 로그인 - 성공 시 JWT 토큰 반환 */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    /** 현재 로그인 사용자 (Authorization: Bearer 토큰 필요) */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me() {
        LoginResponse user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    /** 로그아웃 - 클라이언트에서 토큰 폐기. 서버는 stateless이므로 204만 반환 */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
