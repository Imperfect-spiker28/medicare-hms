package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDto {
    private UUID id;
    private UUID appointmentId;
    private UUID doctorId;
    private UUID patientId;
    private List<PrescriptionItemDto> items;
    private Instant createdAt;
}
