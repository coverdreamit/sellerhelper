package com.sellerhelper.service;

import com.sellerhelper.entity.Role;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.UserRole;
import com.sellerhelper.repository.RoleRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 개발 모드 전용 - 랜덤 데모 사용자 생성
 */
@Profile("local")
@Service
@RequiredArgsConstructor
public class DemoUserService {

    private static final String ADMIN_LOGIN_ID = "admin";
    private static final String DEMO_PASSWORD = "demo123";
    private static final String[] SURNAMES = {"김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"};
    private static final String[] GIVEN_NAMES = {"철수", "영희", "민수", "지연", "성호", "미영", "준서", "유나", "동현", "수진"};
    private static final String[] DOMAINS = {"example.com", "test.co.kr", "demo.com", "sample.net"};
    private static final String[] ROLE_CODES = {"ADMIN", "SELLER", "ORDER"};

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random();
    private final AtomicInteger seq = new AtomicInteger(0);

    @Transactional
    public int createDemoUsers(int count) {
        List<Role> roles = roleRepository.findAll();
        Map<String, Long> roleMap = new HashMap<>();
        for (Role r : roles) {
            roleMap.put(r.getCode(), r.getUid());
        }

        int created = 0;
        for (int i = 0; i < count; i++) {
            String loginId = generateUniqueLoginId();
            if (userRepository.existsByLoginId(loginId)) continue;

            User user = userRepository.save(User.builder()
                    .loginId(loginId)
                    .password(passwordEncoder.encode(DEMO_PASSWORD))
                    .name(generateName())
                    .email(generateEmail(loginId))
                    .enabled(true)
                    .build());

            String roleCode = ROLE_CODES[random.nextInt(ROLE_CODES.length)];
            Long roleUid = roleMap.get(roleCode);
            if (roleUid != null) {
                final User savedUser = user;
                roleRepository.findById(roleUid).ifPresent(role ->
                        userRoleRepository.save(UserRole.builder().user(savedUser).role(role).build()));
            }
            created++;
        }
        return created;
    }

    private String generateUniqueLoginId() {
        return "demo" + System.currentTimeMillis() % 100000 + seq.incrementAndGet();
    }

    private String generateName() {
        return SURNAMES[random.nextInt(SURNAMES.length)] + GIVEN_NAMES[random.nextInt(GIVEN_NAMES.length)];
    }

    private String generateEmail(String loginId) {
        return loginId + "@" + DOMAINS[random.nextInt(DOMAINS.length)];
    }

    /** admin 제외 모든 사용자 삭제 */
    @Transactional
    public int resetUsersExceptAdmin() {
        List<User> toDelete = userRepository.findByLoginIdNot(ADMIN_LOGIN_ID);
        for (User user : toDelete) {
            userRoleRepository.deleteByUserUid(user.getUid());
            userRepository.delete(user);
        }
        return toDelete.size();
    }
}
