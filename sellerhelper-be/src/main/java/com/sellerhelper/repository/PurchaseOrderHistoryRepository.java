package com.sellerhelper.repository;

import com.sellerhelper.entity.PurchaseOrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderHistoryRepository extends JpaRepository<PurchaseOrderHistory, Long> {

    List<PurchaseOrderHistory> findByUser_UidOrderByCreatedAtDescUidDesc(Long userUid);

    Optional<PurchaseOrderHistory> findByUidAndUser_Uid(Long uid, Long userUid);
}
