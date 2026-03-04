package com.sellerhelper.service;

import com.sellerhelper.dto.company.CompanyCreateRequest;
import com.sellerhelper.dto.company.CompanyResponse;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.User;
import com.sellerhelper.repository.CompanyRepository;
import com.sellerhelper.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/** 회사 CRUD 서비스 */
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

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
    public CompanyResponse createMyCompany(Long userUid, CompanyCreateRequest req) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        if (user.getCompany() != null) {
            throw new IllegalArgumentException("이미 회사가 등록되어 있습니다.");
        }
        Company company = Company.builder()
                .name(req.getName())
                .businessNumber(req.getBusinessNumber())
                .address(req.getAddress())
                .phone(req.getPhone())
                .email(req.getEmail())
                .ceoName(req.getCeoName())
                .build();
        company = companyRepository.save(company);
        user.setCompany(company);
        userRepository.save(user);
        return toResponse(company);
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
                .build();
    }
}
