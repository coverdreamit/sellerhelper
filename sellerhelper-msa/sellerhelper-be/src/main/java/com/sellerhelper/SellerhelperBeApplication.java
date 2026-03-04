package com.sellerhelper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.sellerhelper", "com.sellerhelper.core"})
public class SellerhelperBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SellerhelperBeApplication.class, args);
    }
}
