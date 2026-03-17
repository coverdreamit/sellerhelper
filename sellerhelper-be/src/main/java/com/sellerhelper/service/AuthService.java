package com.sellerhelper.service;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.core.security.JwtTokenProvider;
import com.sellerhelper.dto.auth.LoginRequest;
import com.sellerhelper.dto.auth.LoginResponse;
import com.sellerhelper.dto.auth.RegisterRequest;
import com.sellerhelper.dto.auth.RegisterResponse;
import com.sellerhelper.entity.Role;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.UserApprovalStatus;
import com.sellerhelper.entity.UserRole;
import com.sellerhelper.exception.DuplicateLoginIdException;
import com.sellerhelper.exception.InvalidCredentialsException;
import com.sellerhelper.repository.RoleRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.util.StringUtils.hasText;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String USER_ROLE_CODE = "USER";

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.getEnabled()) {
            throw new InvalidCredentialsException("승인 대기 중입니다. 관리자에게 문의하세요.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        List<UserRole> userRoles = userRoleRepository.findByUser_Uid(user.getUid());
        List<String> roleCodes = userRoles.stream()
                .map(ur -> ur.getRole().getCode())
                .collect(Collectors.toList());
        List<String> menuKeys = roleService.findMenuKeysByRoleCodes(roleCodes);
        Long companyUid = user.getCompany() != null ? user.getCompany().getUid() : null;
        boolean businessDocumentUploaded = user.getCompany() != null && hasText(user.getCompany().getBusinessDocumentPath());

        String token = jwtTokenProvider.createToken(
                user.getUid(),
                user.getLoginId(),
                user.getName(),
                roleCodes,
                companyUid
        );
        return LoginResponse.of(token, user.getUid(), user.getLoginId(), user.getName(),
                roleCodes, menuKeys, companyUid, businessDocumentUploaded,
                user.getApprovalStatus() != null ? user.getApprovalStatus().name() : null);
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new DuplicateLoginIdException(request.getLoginId());
        }

        Role userRole = roleRepository.findByCode(USER_ROLE_CODE)
                .orElseThrow(() -> new IllegalStateException("USER role not found. Run DB migration."));

        User user = User.builder()
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                // 회원가입 직후 로그인은 허용하고, 회사/증빙 등록 후 최종 승인 대기로 전환한다.
                .enabled(true)
                .approvalStatus(UserApprovalStatus.INITIAL_APPROVED)
                .build();
        user = userRepository.save(user);
        userRoleRepository.save(UserRole.builder().user(user).role(userRole).build());

        return RegisterResponse.of(user.getUid(), user.getLoginId(), user.getName(), false);
    }

    @Transactional(readOnly = true)
    public LoginResponse getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof AuthUser)) {
            return null;
        }
        AuthUser authUser = (AuthUser) principal;
        List<String> menuKeys = roleService.findMenuKeysByRoleCodes(authUser.getRoleCodes());
        boolean businessDocumentUploaded = userRepository.findById(authUser.getUid())
                .map(u -> u.getCompany() != null && hasText(u.getCompany().getBusinessDocumentPath()))
                .orElse(false);
        return LoginResponse.of(null, authUser.getUid(), authUser.getLoginId(), authUser.getName(),
                authUser.getRoleCodes(), menuKeys, authUser.getCompanyUid(), businessDocumentUploaded,
                userRepository.findById(authUser.getUid())
                        .map(u -> u.getApprovalStatus() != null ? u.getApprovalStatus().name() : null)
                        .orElse(null));
    }
}
