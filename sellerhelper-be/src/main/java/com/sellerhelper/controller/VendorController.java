package com.sellerhelper.controller;

import com.sellerhelper.core.security.AuthUser;
import com.sellerhelper.dto.vendor.VendorResponse;
import com.sellerhelper.dto.vendor.VendorSaveRequest;
import com.sellerhelper.dto.vendor.VendorFormTemplatePreviewResponse;
import com.sellerhelper.dto.vendor.VendorFormTemplateMappingItem;
import com.sellerhelper.dto.vendor.VendorFormTemplateMappingSaveRequest;
import com.sellerhelper.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** 셀러용 발주업체 API */
@Profile({"portal", "commerce", "local"})
@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @GetMapping
    public ResponseEntity<List<VendorResponse>> list(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorService.findMyVendors(authUser.getUid()));
    }

    @PostMapping
    public ResponseEntity<VendorResponse> create(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody VendorSaveRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vendorService.createMyVendor(authUser.getUid(), request));
    }

    @PutMapping("/{vendorId}")
    public ResponseEntity<VendorResponse> update(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId,
            @Valid @RequestBody VendorSaveRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorService.updateMyVendor(authUser.getUid(), vendorId, request));
    }

    @PostMapping(value = "/{vendorId}/form-template", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VendorResponse> uploadFormTemplate(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId,
            @RequestPart("file") MultipartFile file) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorService.uploadMyVendorFormTemplate(authUser.getUid(), vendorId, file));
    }

    @GetMapping("/{vendorId}/form-template")
    public ResponseEntity<byte[]> downloadFormTemplate(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        VendorService.VendorTemplateFileResult file = vendorService.findMyVendorFormTemplate(authUser.getUid(), vendorId);
        String contentType = file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String fileName = file.getFileName() != null ? file.getFileName() : "vendor-form-template";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName, StandardCharsets.UTF_8).build());
        headers.setContentLength(file.getFile().length);

        return new ResponseEntity<>(file.getFile(), headers, HttpStatus.OK);
    }

    @GetMapping("/{vendorId}/form-template/preview")
    public ResponseEntity<VendorFormTemplatePreviewResponse> previewFormTemplate(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorService.findMyVendorFormTemplatePreview(authUser.getUid(), vendorId));
    }

    @GetMapping("/{vendorId}/form-template/mappings")
    public ResponseEntity<List<VendorFormTemplateMappingItem>> getFormTemplateMappings(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorService.findMyVendorFormTemplateMappings(authUser.getUid(), vendorId));
    }

    @PutMapping("/{vendorId}/form-template/mappings")
    public ResponseEntity<List<VendorFormTemplateMappingItem>> saveFormTemplateMappings(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long vendorId,
            @RequestBody VendorFormTemplateMappingSaveRequest request) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(vendorService.saveMyVendorFormTemplateMappings(authUser.getUid(), vendorId, request));
    }
}
