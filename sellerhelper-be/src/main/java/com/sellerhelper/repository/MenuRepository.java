package com.sellerhelper.repository;

import com.sellerhelper.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    Optional<Menu> findByKey(String key);

    List<Menu> findByEnabledTrueOrderBySortOrderAsc();

    List<Menu> findByParentKeyOrderBySortOrderAsc(String parentKey);
}
