package com.hospital.service;

import com.hospital.dto.AdminStatsResponse;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.Department;
import com.hospital.entity.Role;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorProfileRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalPatients = userRepository.countByRole(Role.PATIENT);
        long totalDoctors = userRepository.countByRole(Role.DOCTOR);
        long totalDepartments = departmentRepository.count();
        long todaysAppointmentCount = appointmentRepository.countByDate(LocalDate.now());

        Map<String, Long> statusCounts = new HashMap<>();
        for (AppointmentStatus status : AppointmentStatus.values()) {
            statusCounts.put(status.name(), 0L);
        }
        List<Object[]> statusGroups = appointmentRepository.countAppointmentsByStatusGroup();
        for (Object[] row : statusGroups) {
            AppointmentStatus st = (AppointmentStatus) row[0];
            Long cnt = (Long) row[1];
            statusCounts.put(st.name(), cnt);
        }

        List<Department> departments = departmentRepository.findAll();
        List<AdminStatsResponse.DepartmentStatDto> byDepartment = new ArrayList<>();
        for (Department dept : departments) {
            long apptCount = appointmentRepository.countByDepartmentId(dept.getId());
            long docCount = doctorProfileRepository.findByDepartmentId(dept.getId()).size();
            byDepartment.add(AdminStatsResponse.DepartmentStatDto.builder()
                    .department(dept.getName())
                    .appointments(apptCount)
                    .doctors(docCount)
                    .build());
        }

        LocalDate today = LocalDate.now();
        List<AdminStatsResponse.DailyTrendDto> last7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long count = appointmentRepository.countByDate(d);
            last7Days.add(AdminStatsResponse.DailyTrendDto.builder()
                    .date(d.toString())
                    .count(count)
                    .build());
        }

        return AdminStatsResponse.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .totalDepartments(totalDepartments)
                .todaysAppointmentCount(todaysAppointmentCount)
                .statusCounts(statusCounts)
                .byDepartment(byDepartment)
                .last7Days(last7Days)
                .build();
    }
}
