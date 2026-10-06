package com.hospital.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequest {

    @NotEmpty(message = "Prescription must contain at least one item")
    @Valid
    private List<PrescriptionItemDto> items;
}
