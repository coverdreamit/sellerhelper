package com.sellerhelper.repository;

import com.sellerhelper.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByEnabledTrueOrderBySortOrderAsc();

    boolean existsByProductNo(String productNo);
}
