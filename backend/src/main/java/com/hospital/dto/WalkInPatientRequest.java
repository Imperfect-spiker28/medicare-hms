package com.hospital.dto;

import com.hospital.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalkInPatientRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, message = "Full name must be at least 2 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Size(min = 10, message = "Phone number must be at least 10 digits")
    private String phone;

    private String email;

    private Gender gender;

    private LocalDate dateOfBirth;

    private String address;
}
