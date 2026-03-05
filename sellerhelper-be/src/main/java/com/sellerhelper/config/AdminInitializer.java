package com.sellerhelper.config;

import com.sellerhelper.entity.Role;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.UserRole;
import com.sellerhelper.repository.RoleRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 애플리케이션 시작 시 임시 관리자 계정 초기화.
 * admin/admin 계정이 없으면 자동 생성.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {

    private static final String ADMIN_LOGIN_ID = "admin";
    private static final String ADMIN_PASSWORD = "admin";
    private static final String ADMIN_ROLE_CODE = "ADMIN";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Always ensure USER/ADMIN roles exist (required for both admin and registration)
        ensureUserRole();
        ensureAdminRole();

        if (userRepository.existsByLoginId(ADMIN_LOGIN_ID)) {
            log.debug("Admin account (admin) already exists. Skipping admin creation.");
            return;
        }

        Role adminRole = roleRepository.findByCode(ADMIN_ROLE_CODE).orElseThrow();
        User admin = createAdminUser(adminRole);
        userRoleRepository.save(UserRole.builder().user(admin).role(adminRole).build());
        log.info("Temporary admin account created: loginId={}. Please change password.", ADMIN_LOGIN_ID);
    }

    private Role ensureAdminRole() {
        return roleRepository.findByCode(ADMIN_ROLE_CODE)
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .code(ADMIN_ROLE_CODE)
                            .name("관리자")
                            .description("시스템 전체 관리 권한")
                            .build();
                    role.setSortOrder(1);
                    return roleRepository.save(role);
                });
    }

    private void ensureUserRole() {
        if (roleRepository.findByCode("USER").isPresent()) return;
        Role role = Role.builder()
                .code("USER")
                .name("일반 사용자")
                .description("승인된 일반 사용자 권한")
                .build();
        role.setSortOrder(2);
        roleRepository.save(role);
    }

    private User createAdminUser(Role adminRole) {
        return userRepository.save(User.builder()
                .loginId(ADMIN_LOGIN_ID)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .name("관리자")
                .enabled(true)
                .build());
    }
}
