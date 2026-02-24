package com.sellerhelper.service;

import com.sellerhelper.config.AuthUser;
import com.sellerhelper.dto.auth.LoginRequest;
import com.sellerhelper.dto.auth.LoginResponse;
import com.sellerhelper.dto.auth.RegisterRequest;
import com.sellerhelper.dto.auth.RegisterResponse;
import com.sellerhelper.entity.Role;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.UserRole;
import com.sellerhelper.exception.DuplicateLoginIdException;
import com.sellerhelper.exception.InvalidCredentialsException;
import com.sellerhelper.repository.RoleRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.UserRoleRepository;
import com.sellerhelper.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/** 인증(로그인/회원가입) 서비스 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String USER_ROLE_CODE = "USER";

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.getEnabled()) {
            throw new InvalidCredentialsException("Pending approval. Contact administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        List<UserRole> userRoles = userRoleRepository.findByUser_Uid(user.getUid());
        List<String> roleCodes = userRoles.stream()
                .map(ur -> ur.getRole().getCode())
                .collect(Collectors.toList());
        List<String> menuKeys = roleService.findMenuKeysByRoleCodes(roleCodes);

        return LoginResponse.of(user.getUid(), user.getLoginId(), user.getName(), roleCodes, menuKeys);
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new DuplicateLoginIdException(request.getLoginId());
        }

        Role userRole = roleRepository.findByCode(USER_ROLE_CODE)
                .orElseThrow(() -> new IllegalStateException("USER role not found. Contact administrator."));

        User user = User.builder()
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .enabled(false)  // 승인 대기
                .build();
        user = userRepository.save(user);
        userRoleRepository.save(UserRole.builder().user(user).role(userRole).build());

        return RegisterResponse.of(user.getUid(), user.getLoginId(), user.getName(), false);
    }

    /** 로그인 성공 후 세션에 인증 정보 저장 */
    public void establishSession(LoginResponse res, HttpServletRequest request) {
        AuthUser authUser = AuthUser.forSession(res.getUid(), res.getLoginId(), res.getName(), res.getRoleCodes());
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(authUser, null, authUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(token);
        request.getSession(true);
    }

    /** 현재 세션 사용자 조회 */
    public LoginResponse getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof AuthUser)) {
            return null;
        }
        AuthUser authUser = (AuthUser) principal;
        List<String> menuKeys = roleService.findMenuKeysByRoleCodes(authUser.getRoleCodes());
        return LoginResponse.of(authUser.getUid(), authUser.getLoginId(), authUser.getName(), authUser.getRoleCodes(), menuKeys);
    }
}
