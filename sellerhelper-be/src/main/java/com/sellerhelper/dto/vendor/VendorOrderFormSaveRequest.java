package com.sellerhelper.dto.vendor;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Getter
@Setter
public class VendorOrderFormSaveRequest {

    @NotBlank(message = "양식명을 입력하세요.")
    @Size(max = 200)
    private String formName;

    @NotNull
    private Boolean active;

    @NotNull(message = "컬럼 순서를 지정하세요.")
    private List<@NotBlank @Size(max = 64) String> columnKeys;

    /** null 이면 생성 시 기본값, 수정 시 기존 값 유지 */
    private List<@Size(max = 64) String> purchaseColumnKeys;
}
