package com.sellerhelper.repository;

import com.sellerhelper.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findByUser_Uid(Long userUid);

    @Modifying
    @Query("DELETE FROM UserRole ur WHERE ur.user.uid = :userUid")
    void deleteByUserUid(Long userUid);

    long countByRole_Uid(Long roleUid);
}
