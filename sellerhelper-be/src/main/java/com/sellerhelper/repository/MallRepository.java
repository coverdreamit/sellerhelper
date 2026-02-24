package com.sellerhelper.repository;

import com.sellerhelper.entity.Mall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MallRepository extends JpaRepository<Mall, Long> {

    Optional<Mall> findByCode(String code);

    List<Mall> findByEnabledTrueOrderBySortOrderAsc();

    List<Mall> findAllByOrderBySortOrderAscUidAsc();
}
