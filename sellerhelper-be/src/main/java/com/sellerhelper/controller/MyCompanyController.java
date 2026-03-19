package com.sellerhelper.controller;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.dto.company.CompanyCreateRequest;
import com.sellerhelper.dto.company.CompanyResponse;
import com.sellerhelper.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.nio.charset.StandardCharsets;

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
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponse> createMyCompany(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @ModelAttribute CompanyCreateRequest request,
            @RequestPart(value = "businessLicenseFile", required = false) MultipartFile businessLicenseFile) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyService.createMyCompany(authUser.getUid(), request, businessLicenseFile));
    }

    /** 내 회사 수정 */
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponse> updateMyCompany(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @ModelAttribute CompanyCreateRequest request,
            @RequestPart(value = "businessLicenseFile", required = false) MultipartFile businessLicenseFile) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(companyService.updateMyCompany(authUser.getUid(), request, businessLicenseFile));
    }

    /** 내 사업자등록증 미리보기 */
    @GetMapping("/business-license")
    public ResponseEntity<byte[]> getMyBusinessLicense(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CompanyService.BusinessLicenseFileResult file = companyService.findMyBusinessLicense(authUser.getUid());

        String contentType = file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String fileName = file.getFileName() != null ? file.getFileName() : "business-license";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(ContentDisposition.inline().filename(fileName, StandardCharsets.UTF_8).build());
        headers.setContentLength(file.getFile().length);

        return new ResponseEntity<>(file.getFile(), headers, HttpStatus.OK);
    }
}
