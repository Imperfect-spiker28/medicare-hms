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
public class CreateLabOrderRequest {

    @NotBlank(message = "Test name is required")
    private String testName;

    private String testCategory;

    private String sampleType;

    private String clinicalNotes;
}
