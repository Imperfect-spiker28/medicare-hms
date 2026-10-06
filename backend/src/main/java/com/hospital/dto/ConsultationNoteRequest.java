package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationNoteRequest {

    @NotBlank(message = "Diagnosis is required")
    @Size(min = 2, message = "Diagnosis must be at least 2 characters")
    private String diagnosis;

    @NotBlank(message = "Notes are required")
    @Size(min = 2, message = "Notes must be at least 2 characters")
    private String notes;
}
