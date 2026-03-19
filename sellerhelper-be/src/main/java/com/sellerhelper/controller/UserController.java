package com.sellerhelper.controller;

import com.sellerhelper.dto.common.PageResponse;
import com.sellerhelper.dto.user.UserCreateRequest;
import com.sellerhelper.dto.user.UserListResponse;
import com.sellerhelper.dto.user.UserResponse;
import com.sellerhelper.dto.user.UserUpdateRequest;
import com.sellerhelper.service.CompanyService;
import com.sellerhelper.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.nio.charset.StandardCharsets;

/** 사용자 관리 REST API */
@Profile({"portal", "local"})
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CompanyService companyService;

    /** 사용자 목록 (페이지네이션, 검색, 권한/승인상태 필터) */
    @GetMapping
    public ResponseEntity<PageResponse<UserListResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "uid") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(userService.search(keyword, roleCode, enabled, pageable));
    }

    /** 사용자 단건 조회 */
    @GetMapping("/{uid}")
    public ResponseEntity<UserResponse> get(@PathVariable Long uid) {
        return ResponseEntity.ok(userService.findById(uid));
    }

    /** 사용자의 사업자등록증 미리보기 */
    @GetMapping("/{uid}/business-license")
    public ResponseEntity<byte[]> getBusinessLicense(@PathVariable Long uid) {
        CompanyService.BusinessLicenseFileResult file = companyService.findBusinessLicenseByUserUid(uid);

        String contentType = file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String fileName = file.getFileName() != null ? file.getFileName() : "business-license";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(ContentDisposition.inline().filename(fileName, StandardCharsets.UTF_8).build());
        headers.setContentLength(file.getFile().length);

        return new ResponseEntity<>(file.getFile(), headers, HttpStatus.OK);
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
