package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabOrderDto {
    private UUID id;
    private String orderNumber;
    private UUID appointmentId;
    private UUID patientId;
    private String patientName;
    private String patientCode;
    private String doctorName;
    private String testName;
    private String testCategory;
    private String sampleType;
    private String status;
    private String clinicalNotes;
    private String resultValue;
    private String referenceRange;
    private String interpretation;
    private String technicianRemarks;
    private Instant completedAt;
    private Instant createdAt;
}
