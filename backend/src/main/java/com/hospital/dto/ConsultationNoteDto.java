package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationNoteDto {
    private UUID id;
    private UUID appointmentId;
    private UUID doctorId;
    private UUID patientId;
    private String diagnosis;
    private String notes;
    private Instant createdAt;
}
