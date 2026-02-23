package com.sellerhelper.repository;

import com.sellerhelper.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    @Query(value = "SELECT DISTINCT u FROM User u " +
            "LEFT JOIN u.userRoles ur " +
            "LEFT JOIN ur.role r " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.loginId) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:roleCode IS NULL OR :roleCode = '' OR r.code = :roleCode)",
            countQuery = "SELECT COUNT(DISTINCT u.uid) FROM User u " +
                    "LEFT JOIN u.userRoles ur " +
                    "LEFT JOIN ur.role r " +
                    "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.loginId) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "AND (:roleCode IS NULL OR :roleCode = '' OR r.code = :roleCode)")
    Page<User> search(@Param("keyword") String keyword, @Param("roleCode") String roleCode, Pageable pageable);
}
