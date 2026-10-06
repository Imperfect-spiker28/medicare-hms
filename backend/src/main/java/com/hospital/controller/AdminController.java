package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.security.UserPrincipal;
import com.hospital.service.AdminService;
import com.hospital.service.DepartmentService;
import com.hospital.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final DepartmentService departmentService;
    private final DoctorService doctorService;

    @GetMapping("/departments")
    public ResponseEntity<Map<String, List<DepartmentDto>>> getDepartments() {
        List<DepartmentDto> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(Map.of("departments", departments));
    }

    @PostMapping("/departments")
    public ResponseEntity<Map<String, DepartmentDto>> createDepartment(
            @Valid @RequestBody CreateDepartmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        DepartmentDto department = departmentService.createDepartment(request, principal.getId());
        return ResponseEntity.ok(Map.of("department", department));
    }

    @GetMapping("/doctors")
    public ResponseEntity<Map<String, List<DoctorDto>>> getDoctors() {
        List<DoctorDto> doctors = doctorService.getAllDoctorsForAdmin();
        return ResponseEntity.ok(Map.of("doctors", doctors));
    }

    @PostMapping("/doctors")
    public ResponseEntity<Map<String, DoctorDto>> createDoctor(
            @Valid @RequestBody CreateDoctorRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        DoctorDto doctor = doctorService.createDoctor(request, principal.getId());
        return ResponseEntity.ok(Map.of("doctor", doctor));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        AdminStatsResponse stats = adminService.getStats();
        return ResponseEntity.ok(stats);
    }
}
