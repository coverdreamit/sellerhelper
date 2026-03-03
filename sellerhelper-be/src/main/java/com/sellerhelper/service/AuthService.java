package com.sellerhelper.service;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.dto.auth.LoginResponse;
import com.sellerhelper.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 인증 서비스 - JWT 기반.
 * 로그인/회원가입은 Portal 서버에서 처리. 이 서비스는 토큰으로부터 현재 사용자 정보만 조회.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final RoleService roleService;

    @Transactional(readOnly = true)
    public LoginResponse getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof AuthUser)) {
            return null;
        }
        AuthUser authUser = (AuthUser) principal;
        List<String> menuKeys = roleService.findMenuKeysByRoleCodes(authUser.getRoleCodes());
        return LoginResponse.of(authUser.getUid(), authUser.getLoginId(), authUser.getName(),
                authUser.getRoleCodes(), menuKeys, authUser.getCompanyUid());
    }
}
