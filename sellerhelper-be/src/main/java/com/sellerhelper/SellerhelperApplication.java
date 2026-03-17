package com.sellerhelper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SellerhelperApplication {

    public static void main(String[] args) {
        SpringApplication.run(SellerhelperApplication.class, args);
    }
}
