package com.sellerhelper.service;

import com.sellerhelper.dto.role.RoleCreateRequest;
import com.sellerhelper.dto.role.RoleResponse;
import com.sellerhelper.dto.role.RoleUpdateRequest;
import com.sellerhelper.entity.Role;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.RoleRepository;
import com.sellerhelper.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/** 권한 CRUD 서비스 */
@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleResponse findByUid(Long uid) {
        Role role = roleRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Role", uid));
        return toResponse(role);
    }

    @Transactional
    public RoleResponse create(RoleCreateRequest req) {
        if (roleRepository.findByCode(req.getCode()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 권한 코드입니다: " + req.getCode());
        }
        Role role = Role.builder()
                .code(req.getCode().toUpperCase())
                .name(req.getName())
                .description(req.getDescription())
                .menuKeys(joinMenuKeys(req.getMenuKeys()))
                .build();
        role = roleRepository.save(role);
        return toResponse(role);
    }

    @Transactional
    public RoleResponse update(Long uid, RoleUpdateRequest req) {
        Role role = roleRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Role", uid));
        if (req.getName() != null) role.setName(req.getName());
        if (req.getDescription() != null) role.setDescription(req.getDescription());
        if (req.getMenuKeys() != null) role.setMenuKeys(joinMenuKeys(req.getMenuKeys()));
        role = roleRepository.save(role);
        return toResponse(role);
    }

    @Transactional
    public void delete(Long uid) {
        Role role = roleRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Role", uid));
        if (userRoleRepository.countByRole_Uid(uid) > 0) {
            throw new IllegalStateException("해당 권한을 가진 사용자가 있어 삭제할 수 없습니다.");
        }
        roleRepository.delete(role);
    }

    /** 사용자의 권한들의 menuKeys 합집합 */
    public List<String> findMenuKeysByRoleCodes(List<String> roleCodes) {
        if (roleCodes == null || roleCodes.isEmpty()) return Collections.emptyList();
        return roleRepository.findAll().stream()
                .filter(r -> roleCodes.contains(r.getCode()))
                .flatMap(r -> parseMenuKeys(r.getMenuKeys()).stream())
                .distinct()
                .collect(Collectors.toList());
    }

    private RoleResponse toResponse(Role role) {
        return RoleResponse.builder()
                .uid(role.getUid())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .menuKeys(parseMenuKeys(role.getMenuKeys()))
                .build();
    }

    private static String joinMenuKeys(List<String> keys) {
        if (keys == null || keys.isEmpty()) return "";
        return String.join(",", keys);
    }

    private static List<String> parseMenuKeys(String s) {
        if (s == null || s.isBlank()) return Collections.emptyList();
        return Arrays.stream(s.split(","))
                .map(String::trim)
                .filter(k -> !k.isEmpty())
                .collect(Collectors.toList());
    }
}
