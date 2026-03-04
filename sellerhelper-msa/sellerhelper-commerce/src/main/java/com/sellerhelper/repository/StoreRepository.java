package com.sellerhelper.repository;

import com.sellerhelper.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByMall_Uid(Long mallUid);

    List<Store> findByCompany_Uid(Long companyUid);

    List<Store> findByCompany_UidOrderBySortOrderAscUidAsc(Long companyUid);

    List<Store> findByEnabledTrueOrderBySortOrderAsc();
}
