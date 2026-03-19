package com.sellerhelper.service;

import com.sellerhelper.dto.company.CompanyCreateRequest;
import com.sellerhelper.dto.company.CompanyResponse;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.User;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.CompanyRepository;
import com.sellerhelper.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/** 회사 CRUD 서비스 */
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Getter
    @RequiredArgsConstructor
    public static class BusinessLicenseFileResult {
        private final byte[] file;
        private final String fileName;
        private final String contentType;
    }

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
    public CompanyResponse createMyCompany(Long userUid, CompanyCreateRequest req, MultipartFile businessLicenseFile) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        if (user.getCompany() != null) {
            throw new IllegalArgumentException("이미 회사가 등록되어 있습니다.");
        }
        Company company = Company.builder()
                .name(requireName(req.getName()))
                .businessNumber(trimToNull(req.getBusinessNumber()))
                .address(trimToNull(req.getAddress()))
                .phone(trimToNull(req.getPhone()))
                .email(trimToNull(req.getEmail()))
                .ceoName(trimToNull(req.getCeoName()))
                .build();
        applyBusinessLicense(company, businessLicenseFile);
        company = companyRepository.save(company);
        user.setCompany(company);
        userRepository.save(user);
        return toResponse(company);
    }

    /** 내 회사 수정 */
    @Transactional
    public CompanyResponse updateMyCompany(Long userUid, CompanyCreateRequest req, MultipartFile businessLicenseFile) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Company company = user.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("등록된 회사 정보가 없습니다.");
        }

        company.setName(requireName(req.getName()));
        company.setBusinessNumber(trimToNull(req.getBusinessNumber()));
        company.setAddress(trimToNull(req.getAddress()));
        company.setPhone(trimToNull(req.getPhone()));
        company.setEmail(trimToNull(req.getEmail()));
        company.setCeoName(trimToNull(req.getCeoName()));
        applyBusinessLicense(company, businessLicenseFile);
        return toResponse(companyRepository.save(company));
    }

    @Transactional(readOnly = true)
    public BusinessLicenseFileResult findMyBusinessLicense(Long userUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return buildBusinessLicenseResult(user.getCompany());
    }

    @Transactional(readOnly = true)
    public BusinessLicenseFileResult findBusinessLicenseByUserUid(Long userUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        return buildBusinessLicenseResult(user.getCompany());
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
                .businessLicenseFileName(c.getBusinessLicenseFileName())
                .businessLicenseContentType(c.getBusinessLicenseContentType())
                .hasBusinessLicenseFile(c.getBusinessLicenseFile() != null && c.getBusinessLicenseFile().length > 0)
                .build();
    }

    private void applyBusinessLicense(Company company, MultipartFile businessLicenseFile) {
        if (businessLicenseFile == null || businessLicenseFile.isEmpty()) {
            return;
        }
        validateBusinessLicenseFile(businessLicenseFile);
        try {
            company.setBusinessLicenseFile(businessLicenseFile.getBytes());
            company.setBusinessLicenseFileName(trimToNull(businessLicenseFile.getOriginalFilename()));
            company.setBusinessLicenseContentType(trimToNull(businessLicenseFile.getContentType()));
        } catch (IOException e) {
            throw new IllegalStateException("사업자등록증 파일을 처리하지 못했습니다.");
        }
    }

    private BusinessLicenseFileResult buildBusinessLicenseResult(Company company) {
        if (company == null) {
            throw new IllegalArgumentException("등록된 회사 정보가 없습니다.");
        }
        byte[] file = company.getBusinessLicenseFile();
        if (file == null || file.length == 0) {
            throw new IllegalArgumentException("사업자등록증 파일이 등록되어 있지 않습니다.");
        }
        return new BusinessLicenseFileResult(
                file,
                trimToNull(company.getBusinessLicenseFileName()),
                trimToNull(company.getBusinessLicenseContentType())
        );
    }

    private void validateBusinessLicenseFile(MultipartFile file) {
        long maxSize = 10L * 1024L * 1024L;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("사업자등록증 파일은 10MB 이하만 업로드할 수 있습니다.");
        }

        String contentType = file.getContentType();
        boolean allowedType = "application/pdf".equalsIgnoreCase(contentType)
                || "image/jpeg".equalsIgnoreCase(contentType)
                || "image/jpg".equalsIgnoreCase(contentType)
                || "image/png".equalsIgnoreCase(contentType);
        if (!allowedType) {
            throw new IllegalArgumentException("사업자등록증 파일은 PDF/JPG/PNG 형식만 업로드할 수 있습니다.");
        }
    }

    private String requireName(String name) {
        String trimmed = trimToNull(name);
        if (trimmed == null) {
            throw new IllegalArgumentException("회사명은 필수입니다.");
        }
        return trimmed;
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
