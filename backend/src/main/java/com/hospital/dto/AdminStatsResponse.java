package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponse {
    private long totalPatients;
    private long totalDoctors;
    private long totalDepartments;
    private long todaysAppointmentCount;
    private Map<String, Long> statusCounts;
    private List<DepartmentStatDto> byDepartment;
    private List<DailyTrendDto> last7Days;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentStatDto {
        private String department;
        private long appointments;
        private long doctors;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyTrendDto {
        private String date;
        private long count;
    }
}
