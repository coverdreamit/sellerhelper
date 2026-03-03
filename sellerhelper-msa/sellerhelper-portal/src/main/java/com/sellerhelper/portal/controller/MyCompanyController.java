package com.sellerhelper.portal.controller;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.portal.dto.company.CompanyCreateRequest;
import com.sellerhelper.portal.dto.company.CompanyResponse;
import com.sellerhelper.portal.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/my-company")
@RequiredArgsConstructor
public class MyCompanyController {

    private final CompanyService companyService;

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
