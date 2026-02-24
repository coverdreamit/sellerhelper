package com.sellerhelper.config;

import com.sellerhelper.entity.User;
import com.sellerhelper.repository.CompanyRepository;
import com.sellerhelper.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 회사 미지정 사용자에게 기본 회사 설정 */
@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class UserCompanyInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var companyOpt = companyRepository.findAll().stream().findFirst();
        if (companyOpt.isEmpty()) return;
        var company = companyOpt.get();
        List<User> usersWithoutCompany = userRepository.findAll().stream()
                .filter(u -> u.getCompany() == null)
                .toList();
        if (usersWithoutCompany.isEmpty()) return;
        for (User u : usersWithoutCompany) {
            u.setCompany(company);
            userRepository.save(u);
        }
        log.info("Set default company for {} user(s).", usersWithoutCompany.size());
    }
}
