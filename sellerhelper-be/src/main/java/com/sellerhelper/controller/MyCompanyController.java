package com.sellerhelper.controller;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.dto.company.CompanyCreateRequest;
import com.sellerhelper.dto.company.CompanyResponse;
import com.sellerhelper.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/** 셀러용 내 회사 API (회사 정보 등록) */
@Profile({"portal", "local"})
@RestController
@RequestMapping("/api/my-company")
@RequiredArgsConstructor
public class MyCompanyController {

    private final CompanyService companyService;

    /** 내 회사 조회 */
    @GetMapping
    public ResponseEntity<CompanyResponse> getMyCompany(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CompanyResponse company = companyService.findMyCompany(authUser.getUid());
        if (company == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(company);
    }

    /** 내 회사 등록 (회사 미등록 시 1회만) */
    @PostMapping
    public ResponseEntity<CompanyResponse> createMyCompany(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody CompanyCreateRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyService.createMyCompany(authUser.getUid(), request));
    }
}
