package com.sellerhelper.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/** 발주업체별 주문 목록 내보내기용 컬럼 순서 설정 */
@Entity
@Table(name = "vendor_order_forms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorOrderForm extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_uid", nullable = false)
    private Vendor vendor;

    @Column(name = "form_name", nullable = false, length = 200)
    private String formName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** JSON 배열: ["mallOrderNo","orderDate",...] — 주문 목록 CSV용 */
    @Column(name = "column_keys_json", nullable = false, columnDefinition = "TEXT")
    private String columnKeysJson;

    /** JSON 배열: 발주 라인(상품-발주업체 기준) 컬럼 키 */
    @Column(name = "purchase_column_keys_json", columnDefinition = "TEXT")
    private String purchaseColumnKeysJson;
}
