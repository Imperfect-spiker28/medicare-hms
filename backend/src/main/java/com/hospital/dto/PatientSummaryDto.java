package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientSummaryDto {
    private UUID id;
    private String fullName;
    private String phone;
    private String email;
    private String patientCode;
}
