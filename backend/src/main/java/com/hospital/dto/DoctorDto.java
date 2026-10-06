package com.hospital.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoctorDto {
    private UUID id;
    private UUID userId;
    private String fullName;
    private String email;
    private Boolean isActive;
    private DepartmentDto department;
    private UUID departmentId;
    private String departmentName;
    private String specialization;
    private String qualification;
    private String registrationNo;
    private BigDecimal consultationFee;
    private Integer yearsExperience;
    private String bio;
    private List<DoctorAvailabilityDto> availability;
    private List<String> onLeaveDates;
}
