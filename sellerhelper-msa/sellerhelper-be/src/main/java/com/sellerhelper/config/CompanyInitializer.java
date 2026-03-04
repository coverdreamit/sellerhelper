package com.sellerhelper.config;

import com.sellerhelper.entity.Company;
import com.sellerhelper.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 애플리케이션 시작 시 기본 회사 초기화 (스토어 소속 선택용) */
@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class CompanyInitializer implements ApplicationRunner {

    private final CompanyRepository companyRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (companyRepository.count() > 0) {
            return;
        }
        companyRepository.save(Company.builder()
                .name("테스트회사")
                .businessNumber("000-00-00000")
                .build());
        log.info("Default company initialized.");
    }
}
