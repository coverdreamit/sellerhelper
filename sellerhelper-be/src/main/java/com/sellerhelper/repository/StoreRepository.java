package com.sellerhelper.repository;

import com.sellerhelper.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByMall_Uid(Long mallUid);

    List<Store> findByCompany_Uid(Long companyUid);

    List<Store> findByCompany_UidOrderBySortOrderAscUidAsc(Long companyUid);

    /** mall, company JOIN FETCH로 N+1 방지 */
    @Query("SELECT s FROM Store s JOIN FETCH s.mall LEFT JOIN FETCH s.company WHERE s.company.uid = :companyUid ORDER BY s.sortOrder ASC, s.uid ASC")
    List<Store> findByCompany_UidOrderBySortOrderAscUidAscWithMallAndCompany(@Param("companyUid") Long companyUid);

    List<Store> findByEnabledTrueOrderBySortOrderAsc();
}
