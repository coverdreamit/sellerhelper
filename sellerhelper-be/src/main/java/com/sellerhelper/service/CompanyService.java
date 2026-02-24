package com.sellerhelper.service;

import com.sellerhelper.dto.company.CompanyResponse;
import com.sellerhelper.entity.Company;
import com.sellerhelper.repository.CompanyRepository;
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

    @Transactional(readOnly = true)
    public List<CompanyResponse> findAll() {
        return companyRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
