package com.sellerhelper.config;

import com.sellerhelper.entity.Mall;
import com.sellerhelper.repository.MallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 애플리케이션 시작 시 기본 플랫폼(Mall) 초기화 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class MallInitializer implements ApplicationRunner {

    private final MallRepository mallRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (mallRepository.count() > 0) {
            return;
        }
        saveMall("COUPANG", "쿠팡", "쿠팡", true, 1);
        saveMall("NAVER", "스마트스토어", "네이버", true, 2);
        saveMall("11ST", "11번가", "11번가", true, 3);
        saveMall("KAKAO", "카카오쇼핑", "카카오", true, 4);
        saveMall("GMARKET", "G마켓", "이베이코리아", true, 5);
        saveMall("AUCTION", "옥션", "이베이코리아", true, 6);
        log.info("Default platforms (Mall) initialized.");
    }

    private void saveMall(String code, String name, String channel, boolean enabled, int sortOrder) {
        Mall m = Mall.builder().code(code).name(name).channel(channel).enabled(enabled).build();
        m.setSortOrder(sortOrder);
        mallRepository.save(m);
    }
}
