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

/** 배송 목록에서 생성한 발주서 이력 */
@Entity
@Table(name = "purchase_order_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_uid", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_uid", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_uid", nullable = false)
    private Vendor vendor;

    @Column(name = "form_name", nullable = false, length = 200)
    private String formName;

    @Column(name = "memo", length = 1000)
    private String memo;

    /** JSON 배열: [101,102,...] */
    @Column(name = "order_uids_json", nullable = false, columnDefinition = "TEXT")
    private String orderUidsJson;

    /** JSON 배열: ["mallOrderNo","productName",...] */
    @Column(name = "column_keys_json", nullable = false, columnDefinition = "TEXT")
    private String columnKeysJson;
}
