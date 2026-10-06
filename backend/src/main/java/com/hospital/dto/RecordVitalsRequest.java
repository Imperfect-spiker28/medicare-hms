package com.hospital.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordVitalsRequest {

    @Pattern(regexp = "^$|^[0-9]{2,3}/[0-9]{2,3}$", message = "Blood pressure format must be like 120/80")
    private String bloodPressure;

    private Integer heartRate;

    private Double temperature;

    private Integer spo2;

    private Double weightKg;
}
