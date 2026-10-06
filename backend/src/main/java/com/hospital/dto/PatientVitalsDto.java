package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientVitalsDto {
    private UUID id;
    private UUID appointmentId;
    private UUID patientId;
    private String recordedByName;
    private String bloodPressure;
    private Integer heartRate;
    private Double temperature;
    private Integer spo2;
    private Double weightKg;
    private LocalDateTime recordedAt;
}
