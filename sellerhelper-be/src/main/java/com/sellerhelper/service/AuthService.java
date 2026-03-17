package com.sellerhelper.service;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.core.security.JwtTokenProvider;
import com.sellerhelper.dto.auth.LoginRequest;
import com.sellerhelper.dto.auth.LoginResponse;
import com.sellerhelper.dto.auth.CompanySearchResponse;
import com.sellerhelper.dto.auth.RegisterRequest;
import com.sellerhelper.dto.auth.RegisterResponse;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.Role;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.UserRole;
import com.sellerhelper.exception.DuplicateLoginIdException;
import com.sellerhelper.exception.InvalidCredentialsException;
import com.sellerhelper.repository.CompanyRepository;
import com.sellerhelper.repository.RoleRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import static org.springframework.util.StringUtils.hasText;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String USER_ROLE_CODE = "USER";

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
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

        String token = jwtTokenProvider.createToken(
                user.getUid(),
                user.getLoginId(),
                user.getName(),
                roleCodes,
                companyUid
        );
        return LoginResponse.of(token, user.getUid(), user.getLoginId(), user.getName(), roleCodes, menuKeys, companyUid);
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new DuplicateLoginIdException(request.getLoginId());
        }

        Role userRole = roleRepository.findByCode(USER_ROLE_CODE)
                .orElseThrow(() -> new IllegalStateException("USER role not found. Run DB migration."));

        Company company = resolveCompanyForRegister(request);

        User user = User.builder()
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .company(company)
                .enabled(false)
                .build();
        user = userRepository.save(user);
        userRoleRepository.save(UserRole.builder().user(user).role(userRole).build());

        return RegisterResponse.of(user.getUid(), user.getLoginId(), user.getName(), false);
    }

    @Transactional(readOnly = true)
    public List<CompanySearchResponse> searchCompanies(String keyword, int size) {
        if (!StringUtils.hasText(keyword)) {
            return List.of();
        }
        int limit = Math.max(1, Math.min(size, 20));
        return companyRepository.findByNameContainingIgnoreCase(keyword.trim(), PageRequest.of(0, limit)).stream()
                .map(c -> CompanySearchResponse.builder()
                        .uid(c.getUid())
                        .name(c.getName())
                        .businessNumber(c.getBusinessNumber())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LoginResponse getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof AuthUser authUser)) {
            return null;
        }
        List<String> menuKeys = roleService.findMenuKeysByRoleCodes(authUser.getRoleCodes());
        return LoginResponse.of(authUser.getUid(), authUser.getLoginId(), authUser.getName(),
                authUser.getRoleCodes(), menuKeys, authUser.getCompanyUid());
    }

    private Company resolveCompanyForRegister(RegisterRequest request) {
        String mode = normalizeMode(request.getRegisterCompanyMode());
        if ("EXISTING".equals(mode)) {
            Long existingCompanyUid = request.getExistingCompanyUid();
            if (existingCompanyUid == null) {
                throw new IllegalArgumentException("기존 회사 가입을 선택한 경우 회사를 선택해 주세요.");
            }
            return companyRepository.findById(existingCompanyUid)
                    .orElseThrow(() -> new IllegalArgumentException("선택한 회사를 찾을 수 없습니다."));
        }

        if ("NEW".equals(mode)) {
            String newCompanyName = trim(request.getNewCompanyName());
            if (!hasText(newCompanyName)) {
                throw new IllegalArgumentException("신규 회사 등록 시 회사명은 필수입니다.");
            }
            String normalizedBusinessNumber = normalizeBusinessNumber(request.getNewBusinessNumber());
            if (hasText(normalizedBusinessNumber)) {
                return companyRepository.findByBusinessNumber(normalizedBusinessNumber)
                        .orElseGet(() -> companyRepository.save(Company.builder()
                                .name(newCompanyName)
                                .businessNumber(normalizedBusinessNumber)
                                .build()));
            }
            return companyRepository.save(Company.builder()
                    .name(newCompanyName)
                    .build());
        }

        // 하위 호환: 기존 companyName 입력 방식 유지
        if (hasText(request.getCompanyName())) {
            String companyName = request.getCompanyName().trim();
            return companyRepository.findByName(companyName)
                    .orElseGet(() -> companyRepository.save(Company.builder()
                            .name(companyName)
                            .build()));
        }
        return null;
    }

    private String normalizeMode(String value) {
        if (!hasText(value)) {
            return null;
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeBusinessNumber(String value) {
        String v = trim(value);
        if (!hasText(v)) {
            return null;
        }
        String digits = v.replaceAll("[^0-9]", "");
        if (digits.length() != 10) {
            throw new IllegalArgumentException("사업자등록번호는 숫자 10자리여야 합니다.");
        }
        return digits;
    }

    private String trim(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
