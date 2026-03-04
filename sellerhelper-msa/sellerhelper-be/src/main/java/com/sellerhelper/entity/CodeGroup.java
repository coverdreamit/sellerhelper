package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 코드 그룹 (공통/주문상태/배송상태/기타)
 */
@Entity
@Table(name = "code_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeGroup extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;
}
