package com.sellerhelper.dto.vendor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorSaveRequest {

    private Long vendorId;

    @NotBlank(message = "업체명은 필수입니다")
    @Size(max = 100)
    private String vendorName;

    @Size(max = 20)
    private String bizNo;

    @Size(max = 100)
    private String managerName;

    @Size(max = 255)
    private String address;

    @Size(max = 255)
    private String addressDetail;

    @Size(max = 50)
    private String phone;

    @Size(max = 100)
    private String email;

    @Size(max = 500)
    private String memo;

    private Boolean isActive;
}
