package com.sellerhelper.config;

import com.sellerhelper.entity.Role;
import com.sellerhelper.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 기존 Role에 menu_keys가 비어있으면 기본값 설정
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class RoleMenuKeysInitializer implements ApplicationRunner {

    private static final String ALL_MENU_KEYS = "dashboard,product,product-list,order,order-list,order-processing,order-claim," +
            "shipping,shipping-list,shipping-pending,shipping-transit,shipping-complete," +
            "sales,sales-status,sales-confirmation,sales-settlement," +
            "customer,customer-list,customer-inquiry,customer-claim," +
            "settings,settings-basic,settings-company,settings-notification,settings-store,settings-store-list," +
            "settings-user-log,settings-supplier,settings-supplier-list,settings-supplier-form," +
            "system,system-user,system-role,system-store,system-batch,system-code,system-log,system-setting";

    private static final String USER_MENU_KEYS = "dashboard,product,product-list,order,order-list,order-processing,order-claim," +
            "shipping,shipping-list,shipping-pending,shipping-transit,shipping-complete," +
            "sales,sales-status,sales-confirmation,sales-settlement," +
            "customer,customer-list,customer-inquiry,customer-claim," +
            "settings,settings-basic,settings-company,settings-notification,settings-store,settings-store-list," +
            "settings-user-log,settings-supplier,settings-supplier-list,settings-supplier-form";

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Role> roles = roleRepository.findAll();
        for (Role role : roles) {
            if (role.getMenuKeys() == null || role.getMenuKeys().isBlank()) {
                String keys = "ADMIN".equals(role.getCode()) ? ALL_MENU_KEYS : USER_MENU_KEYS;
                role.setMenuKeys(keys);
                roleRepository.save(role);
                log.info("Role menu_keys initialized: {} -> {} entries", role.getCode(), keys.split(",").length);
            }
        }
    }
}
