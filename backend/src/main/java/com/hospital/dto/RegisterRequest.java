package com.hospital.dto;

import com.hospital.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Enter a valid email")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Enter a valid phone number")
    @Size(min = 10, message = "Enter a valid phone number")
    private String phone;

    @NotBlank(message = "Password must be at least 8 characters")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private Gender gender;

    private LocalDate dateOfBirth;
}
