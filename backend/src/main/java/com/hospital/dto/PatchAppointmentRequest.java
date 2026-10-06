package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatchAppointmentRequest {

    @NotBlank(message = "Action is required (CANCEL or RESCHEDULE)")
    @Pattern(regexp = "^(CANCEL|RESCHEDULE)$", message = "Action must be CANCEL or RESCHEDULE")
    private String action;

    private String cancelReason;

    private LocalDate date;

    @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Start time must be in HH:mm format")
    private String startTime;
}
