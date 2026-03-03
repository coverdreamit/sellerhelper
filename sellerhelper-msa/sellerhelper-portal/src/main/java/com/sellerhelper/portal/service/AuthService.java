package com.sellerhelper.portal.service;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.core.security.JwtTokenProvider;
import com.sellerhelper.portal.dto.auth.LoginRequest;
import com.sellerhelper.portal.dto.auth.LoginResponse;
import com.sellerhelper.portal.dto.auth.RegisterRequest;
import com.sellerhelper.portal.dto.auth.RegisterResponse;
import com.sellerhelper.portal.entity.Company;
import com.sellerhelper.portal.entity.Role;
import com.sellerhelper.portal.entity.User;
import com.sellerhelper.portal.entity.UserRole;
import com.sellerhelper.portal.exception.DuplicateLoginIdException;
import com.sellerhelper.portal.exception.InvalidCredentialsException;
import com.sellerhelper.portal.repository.CompanyRepository;
import com.sellerhelper.portal.repository.RoleRepository;
import com.sellerhelper.portal.repository.UserRepository;
import com.sellerhelper.portal.repository.UserRoleRepository;
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
    private final CompanyRepository companyRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

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
                .orElseThrow(() -> new IllegalStateException("USER role not found. Contact administrator."));

        Company company = null;
        if (hasText(request.getCompanyName())) {
            company = companyRepository.findByName(request.getCompanyName().trim())
                    .orElseGet(() -> companyRepository.save(Company.builder()
                            .name(request.getCompanyName().trim())
                            .build()));
        }

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
    public LoginResponse getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof AuthUser)) {
            return null;
        }
        AuthUser authUser = (AuthUser) principal;
        List<String> menuKeys = roleService.findMenuKeysByRoleCodes(authUser.getRoleCodes());
        return LoginResponse.builder()
                .token(null)
                .uid(authUser.getUid())
                .loginId(authUser.getLoginId())
                .name(authUser.getName())
                .roleCodes(authUser.getRoleCodes())
                .menuKeys(menuKeys)
                .companyUid(authUser.getCompanyUid())
                .build();
    }
}
