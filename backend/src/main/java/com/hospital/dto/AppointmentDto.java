package com.hospital.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.AppointmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AppointmentDto {
    private UUID id;
    private Integer tokenNumber;
    private UUID patientId;
    private UUID doctorId;
    private UUID departmentId;
    private LocalDate date;
    private String startTime;
    private String endTime;
    private AppointmentType type;
    private AppointmentStatus status;
    private String reasonForVisit;
    private UUID createdBy;
    private String cancelReason;
    private Instant createdAt;
    private Instant updatedAt;

    // Enriched metadata for UI views
    private String patientName;
    private String patientPhone;
    private String doctorName;
    private String departmentName;
}
