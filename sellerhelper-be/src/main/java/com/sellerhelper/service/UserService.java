package com.sellerhelper.service;

import com.sellerhelper.dto.common.PageResponse;
import com.sellerhelper.dto.user.UserCreateRequest;
import com.sellerhelper.dto.user.UserListResponse;
import com.sellerhelper.dto.user.UserResponse;
import com.sellerhelper.dto.user.UserUpdateRequest;
import com.sellerhelper.entity.Role;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.UserApprovalStatus;
import com.sellerhelper.entity.UserRole;
import com.sellerhelper.exception.DuplicateLoginIdException;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.RoleRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

/** 사용자 관리 서비스 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<UserListResponse> search(String keyword, String roleCode, Boolean enabled, Pageable pageable) {
        String kw = StringUtils.hasText(keyword) ? keyword : null;
        String rc = StringUtils.hasText(roleCode) ? roleCode : null;
        Page<User> page = userRepository.search(kw, rc, enabled, pageable);

        List<UserListResponse> content = page.getContent().stream()
                .map(this::toListResponse)
                .collect(Collectors.toList());

        return PageResponse.<UserListResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long uid) {
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("User", uid));
        return toResponse(user);
    }

    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new DuplicateLoginIdException(request.getLoginId());
        }

        User user = User.builder()
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .approvalStatus(Boolean.FALSE.equals(request.getEnabled())
                        ? UserApprovalStatus.PENDING_INITIAL_APPROVAL
                        : UserApprovalStatus.APPROVED)
                .build();
        user = userRepository.save(user);
        final User savedUser = user;

        if (request.getRoleUids() != null && !request.getRoleUids().isEmpty()) {
            for (Long roleUid : request.getRoleUids()) {
                final Long rid = roleUid;
                roleRepository.findById(rid).ifPresent(role ->
                        userRoleRepository.save(UserRole.builder().user(savedUser).role(role).build()));
            }
        }

        return toResponse(userRepository.findById(user.getUid()).orElseThrow());
    }

    @Transactional
    public UserResponse update(Long uid, UserUpdateRequest request) {
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("User", uid));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
            if (Boolean.TRUE.equals(request.getEnabled()) && user.getApprovalStatus() != null) {
                if (user.getApprovalStatus() == UserApprovalStatus.PENDING_INITIAL_APPROVAL) {
                    user.setApprovalStatus(UserApprovalStatus.INITIAL_APPROVED);
                } else if (user.getApprovalStatus() == UserApprovalStatus.PENDING_FINAL_APPROVAL) {
                    user.setApprovalStatus(UserApprovalStatus.APPROVED);
                }
            }
        }
        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoleUids() != null) {
            userRoleRepository.deleteByUserUid(uid);
            for (Long roleUid : request.getRoleUids()) {
                final Long rid = roleUid;
                roleRepository.findById(rid).ifPresent(role ->
                        userRoleRepository.save(UserRole.builder().user(user).role(role).build()));
            }
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(Long uid) {
        if (!userRepository.existsById(uid)) {
            throw new ResourceNotFoundException("User", uid);
        }
        userRoleRepository.deleteByUserUid(uid);
        userRepository.deleteById(uid);
    }

    @Transactional(readOnly = true)
    public BusinessDocumentData getBusinessDocument(Long uid) {
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("User", uid));
        if (user.getCompany() == null || !StringUtils.hasText(user.getCompany().getBusinessDocumentPath())) {
            throw new IllegalArgumentException("해당 사용자의 사업자등록증명서가 등록되어 있지 않습니다.");
        }
        Path path = Paths.get(user.getCompany().getBusinessDocumentPath()).normalize();
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("사업자등록증명서 파일을 찾을 수 없습니다.");
        }
        String filename = StringUtils.hasText(user.getCompany().getBusinessDocumentName())
                ? user.getCompany().getBusinessDocumentName()
                : path.getFileName().toString();
        String contentType;
        try {
            contentType = Files.probeContentType(path);
        } catch (Exception e) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        if (!StringUtils.hasText(contentType)) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return new BusinessDocumentData(path, filename, contentType);
    }

    private UserResponse toResponse(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUser_Uid(user.getUid());
        List<String> roleCodes = userRoles.stream()
                .map(ur -> ur.getRole().getCode())
                .collect(Collectors.toList());
        List<String> roleNames = userRoles.stream()
                .map(ur -> ur.getRole().getName())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .uid(user.getUid())
                .loginId(user.getLoginId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .enabled(user.getEnabled())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .roleCodes(roleCodes)
                .roleNames(roleNames)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .businessNumber(user.getCompany() != null ? user.getCompany().getBusinessNumber() : null)
                .businessDocumentUploaded(user.getCompany() != null &&
                        StringUtils.hasText(user.getCompany().getBusinessDocumentPath()))
                .businessDocumentName(user.getCompany() != null ? user.getCompany().getBusinessDocumentName() : null)
                .approvalStatus(user.getApprovalStatus() != null ? user.getApprovalStatus().name() : null)
                .build();
    }

    private UserListResponse toListResponse(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUser_Uid(user.getUid());
        String roleNames = userRoles.stream()
                .map(ur -> ur.getRole().getName())
                .collect(Collectors.joining(", "));

        return UserListResponse.builder()
                .uid(user.getUid())
                .loginId(user.getLoginId())
                .name(user.getName())
                .email(user.getEmail())
                .roleNames(roleNames.isEmpty() ? null : roleNames)
                .enabled(user.getEnabled())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .businessDocumentUploaded(user.getCompany() != null &&
                        StringUtils.hasText(user.getCompany().getBusinessDocumentPath()))
                .approvalStatus(user.getApprovalStatus() != null ? user.getApprovalStatus().name() : null)
                .build();
    }

    public static class BusinessDocumentData {
        private final Path path;
        private final String filename;
        private final String contentType;

        public BusinessDocumentData(Path path, String filename, String contentType) {
            this.path = path;
            this.filename = filename;
            this.contentType = contentType;
        }

        public Path getPath() {
            return path;
        }

        public String getFilename() {
            return filename;
        }

        public String getContentType() {
            return contentType;
        }
    }
}
