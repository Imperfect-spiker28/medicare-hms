package com.hospital.dto;

import com.hospital.entity.DoctorDay;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailabilityDto {
    private DoctorDay day;
    private String startTime;
    private String endTime;
    private Integer slotMinutes;
}
