package com.sellerhelper.repository;

import com.sellerhelper.entity.VendorOrderForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorOrderFormRepository extends JpaRepository<VendorOrderForm, Long> {

    List<VendorOrderForm> findByVendor_UidOrderByUidDesc(Long vendorUid);

    Optional<VendorOrderForm> findByUidAndVendor_Uid(Long uid, Long vendorUid);

    List<VendorOrderForm> findByVendor_User_UidOrderByUidDesc(Long userUid);
}
