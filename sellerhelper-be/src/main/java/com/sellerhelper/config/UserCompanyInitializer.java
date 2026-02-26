package com.sellerhelper.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 회사 미지정 사용자 처리 - 자동 할당 비활성화
 * 회사 미등록 사용자는 /settings/basic/company에서 직접 등록해야 함
 */
@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class UserCompanyInitializer implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        // 회사 자동 할당 비활성화 - 사용자가 회사 정보 등록 페이지에서 직접 등록
    }
}
