package com.sellerhelper.controller;

import com.sellerhelper.dto.role.RoleCreateRequest;
import com.sellerhelper.dto.role.RoleResponse;
import com.sellerhelper.dto.role.RoleUpdateRequest;
import com.sellerhelper.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/** 권한 관리 REST API */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    /** 권한 목록 */
    @GetMapping
    public ResponseEntity<List<RoleResponse>> list() {
        return ResponseEntity.ok(roleService.findAll());
    }

    /** 권한 단건 조회 */
    @GetMapping("/{uid}")
    public ResponseEntity<RoleResponse> get(@PathVariable Long uid) {
        return ResponseEntity.ok(roleService.findByUid(uid));
    }

    /** 권한 생성 */
    @PostMapping
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody RoleCreateRequest req) {
        return ResponseEntity.ok(roleService.create(req));
    }

    /** 권한 수정 */
    @PutMapping("/{uid}")
    public ResponseEntity<RoleResponse> update(@PathVariable Long uid, @Valid @RequestBody RoleUpdateRequest req) {
        return ResponseEntity.ok(roleService.update(uid, req));
    }

    /** 권한 삭제 */
    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> delete(@PathVariable Long uid) {
        roleService.delete(uid);
        return ResponseEntity.noContent().build();
    }
}
