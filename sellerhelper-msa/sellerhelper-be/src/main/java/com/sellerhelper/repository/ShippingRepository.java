package com.sellerhelper.repository;

import com.sellerhelper.entity.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShippingRepository extends JpaRepository<Shipping, Long> {

    List<Shipping> findByOrderUid(Long orderUid);

    Optional<Shipping> findByOrderUidAndUid(Long orderUid, Long uid);
}
