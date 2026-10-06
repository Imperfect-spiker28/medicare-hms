package com.hospital.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Enter a valid email and password.")
    @Email(message = "Enter a valid email and password.")
    private String email;

    @NotBlank(message = "Enter a valid email and password.")
    private String password;
}
