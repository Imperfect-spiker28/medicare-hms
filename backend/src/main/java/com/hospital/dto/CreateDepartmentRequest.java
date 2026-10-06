package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(min = 2, message = "Department name must be at least 2 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 2, message = "Description must be at least 2 characters")
    private String description;
}
