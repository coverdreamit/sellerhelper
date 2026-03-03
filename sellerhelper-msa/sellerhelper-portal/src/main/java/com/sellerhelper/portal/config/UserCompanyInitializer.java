package com.sellerhelper.portal.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class UserCompanyInitializer implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        // 회사 자동 할당 비활성화
    }
}
