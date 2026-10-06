package com.hospital.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hospital.entity.Gender;
import com.hospital.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private UUID id;
    private Role role;
    private String fullName;
    private String email;
    private String phone;
    private Gender gender;
    private LocalDate dateOfBirth;
    private Boolean isActive;
}
