package com.hospital.dto;

import com.hospital.entity.AppointmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentRequest {

    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;

    private UUID patientId; // Used by receptionist when booking on behalf of patient

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Start time must be in HH:mm format")
    private String startTime;

    private AppointmentType type = AppointmentType.ONLINE;

    @NotBlank(message = "Please describe the reason for your visit.")
    @Size(min = 3, message = "Please describe the reason for your visit.")
    private String reasonForVisit;
}
