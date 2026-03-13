package com.sellerhelper.repository;

import com.sellerhelper.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByUser_UidOrderByUidDesc(Long userUid);

    Optional<Vendor> findByUidAndUser_Uid(Long uid, Long userUid);
}
