package com.hospital.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDoctorRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, message = "Full name must be at least 2 characters")
    private String fullName;

    @NotBlank(message = "Valid email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(min = 10, message = "Phone number must be at least 10 digits")
    private String phone;

    @NotBlank(message = "Password must be at least 8 characters")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Department ID is required")
    private UUID departmentId;

    @NotBlank(message = "Specialization is required")
    @Size(min = 2, message = "Specialization must be at least 2 characters")
    private String specialization;

    @NotBlank(message = "Qualification is required")
    @Size(min = 2, message = "Qualification must be at least 2 characters")
    private String qualification;

    @NotBlank(message = "Registration number is required")
    @Size(min = 2, message = "Registration number must be at least 2 characters")
    private String registrationNo;

    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Fee cannot be negative")
    private BigDecimal consultationFee;

    @NotNull(message = "Years of experience is required")
    @Min(value = 0, message = "Years of experience cannot be negative")
    private Integer yearsExperience;

    private String bio;
}
