package com.sellerhelper.controller;

import com.sellerhelper.dto.common.PageResponse;
import com.sellerhelper.dto.user.UserCreateRequest;
import com.sellerhelper.dto.user.UserListResponse;
import com.sellerhelper.dto.user.UserResponse;
import com.sellerhelper.dto.user.UserUpdateRequest;
import com.sellerhelper.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/** 사용자 관리 REST API */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 사용자 목록 (페이지네이션, 검색, 권한 필터) */
    @GetMapping
    public ResponseEntity<PageResponse<UserListResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "uid") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(userService.search(keyword, roleCode, pageable));
    }

    /** 사용자 단건 조회 */
    @GetMapping("/{uid}")
    public ResponseEntity<UserResponse> get(@PathVariable Long uid) {
        return ResponseEntity.ok(userService.findById(uid));
    }

    /** 사용자 생성 */
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    /** 사용자 수정 */
    @PutMapping("/{uid}")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long uid,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.update(uid, request));
    }

    /** 사용자 삭제 */
    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> delete(@PathVariable Long uid) {
        userService.delete(uid);
        return ResponseEntity.noContent().build();
    }
}
