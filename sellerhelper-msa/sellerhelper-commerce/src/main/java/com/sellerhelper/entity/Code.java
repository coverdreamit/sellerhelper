package com.sellerhelper.entity;

import javax.persistence.*;
import lombok.*;

/**
 * 그룹별 상세 코드
 */
@Entity
@Table(name = "codes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"group_uid", "code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Code extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_uid", nullable = false)
    private CodeGroup group;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String value;

    @Column(length = 500)
    private String description;
}
