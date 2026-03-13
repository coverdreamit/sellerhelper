package com.sellerhelper.repository;

import com.sellerhelper.entity.VendorPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorPolicyRepository extends JpaRepository<VendorPolicy, Long> {

    Optional<VendorPolicy> findByVendor_Uid(Long vendorUid);

    Optional<VendorPolicy> findByVendor_UidAndVendor_User_Uid(Long vendorUid, Long userUid);

    List<VendorPolicy> findByVendor_UidIn(List<Long> vendorUids);
}
