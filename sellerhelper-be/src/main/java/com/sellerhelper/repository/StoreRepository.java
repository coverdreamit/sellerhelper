package com.sellerhelper.repository;

import com.sellerhelper.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByMallUid(Long mallUid);

    List<Store> findByEnabledTrueOrderBySortOrderAsc();
}
