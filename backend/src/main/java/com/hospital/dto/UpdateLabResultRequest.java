package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLabResultRequest {

    @NotBlank(message = "Result value is required")
    private String resultValue;

    private String referenceRange;

    private String interpretation; // e.g. NORMAL, ELEVATED, LOW, ABNORMAL

    private String technicianRemarks;
}
