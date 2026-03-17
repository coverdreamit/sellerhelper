package com.sellerhelper.service;

import com.sellerhelper.dto.company.CompanyCreateRequest;
import com.sellerhelper.dto.company.CompanyResponse;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.UserApprovalStatus;
import com.sellerhelper.repository.CompanyRepository;
import com.sellerhelper.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.util.StringUtils.hasText;

/** 회사 CRUD 서비스 */
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    @Value("${app.business-doc-upload-dir:${user.home}/sellerhelper/uploads/business-docs}")
    private String businessDocUploadDir;

    @Transactional(readOnly = true)
    public List<CompanyResponse> findAll() {
        return companyRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** 내 회사 조회 (소속 회사가 있으면 반환) */
    @Transactional(readOnly = true)
    public CompanyResponse findMyCompany(Long userUid) {
        User user = userRepository.findById(userUid).orElse(null);
        if (user == null || user.getCompany() == null) return null;
        return toResponse(user.getCompany());
    }

    /** 내 회사 등록 (회사 미등록 사용자만, 1회) */
    @Transactional
    public CompanyResponse createMyCompany(Long userUid, CompanyCreateRequest req, MultipartFile businessDocument) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Company company = user.getCompany();
        if (company != null && hasText(company.getBusinessDocumentPath())) {
            throw new IllegalArgumentException("이미 회사 및 사업자등록증명서가 등록되어 있습니다.");
        }
        if (businessDocument == null || businessDocument.isEmpty()) {
            throw new IllegalArgumentException("사업자등록증명서 파일은 필수입니다.");
        }

        String contentType = businessDocument.getContentType();
        boolean allowedType = MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(contentType)
                || MediaType.IMAGE_PNG_VALUE.equalsIgnoreCase(contentType)
                || MediaType.IMAGE_JPEG_VALUE.equalsIgnoreCase(contentType);
        if (!allowedType) {
            throw new IllegalArgumentException("사업자등록증명서는 PDF/JPG/PNG만 업로드할 수 있습니다.");
        }

        String storedPath = storeBusinessDocument(businessDocument);
        if (company == null) {
            company = new Company();
        }
        company.setName(req.getName());
        company.setBusinessNumber(req.getBusinessNumber());
        company.setAddress(req.getAddress());
        company.setPhone(req.getPhone());
        company.setEmail(req.getEmail());
        company.setCeoName(req.getCeoName());
        company.setBusinessDocumentName(businessDocument.getOriginalFilename());
        company.setBusinessDocumentPath(storedPath);
        company = companyRepository.save(company);
        if (user.getCompany() == null) {
            user.setCompany(company);
        }
        user.setEnabled(false);
        user.setApprovalStatus(UserApprovalStatus.PENDING_FINAL_APPROVAL);
        userRepository.save(user);
        return toResponse(company);
    }

    private String storeBusinessDocument(MultipartFile businessDocument) {
        try {
            Path uploadDir = Paths.get(businessDocUploadDir).normalize();
            Files.createDirectories(uploadDir);

            String ext = "";
            String original = businessDocument.getOriginalFilename();
            if (hasText(original) && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.'));
            }
            String filename = UUID.randomUUID() + ext;
            Path target = uploadDir.resolve(filename).normalize();
            Files.copy(businessDocument.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target.toString();
        } catch (IOException e) {
            throw new IllegalStateException("사업자등록증명서 저장 중 오류가 발생했습니다.");
        }
    }

    private CompanyResponse toResponse(Company c) {
        return CompanyResponse.builder()
                .uid(c.getUid())
                .name(c.getName())
                .businessNumber(c.getBusinessNumber())
                .address(c.getAddress())
                .phone(c.getPhone())
                .email(c.getEmail())
                .ceoName(c.getCeoName())
                .businessDocumentName(c.getBusinessDocumentName())
                .businessDocumentUploaded(hasText(c.getBusinessDocumentPath()))
                .build();
    }
}
