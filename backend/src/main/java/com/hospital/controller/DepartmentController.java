package com.hospital.controller;

import com.hospital.dto.DepartmentDto;
import com.hospital.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<Map<String, List<DepartmentDto>>> getDepartments() {
        List<DepartmentDto> departments = departmentService.getActiveDepartments();
        return ResponseEntity.ok(Map.of("departments", departments));
    }
}
