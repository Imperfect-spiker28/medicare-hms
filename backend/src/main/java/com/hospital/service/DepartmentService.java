package com.hospital.service;

import com.hospital.dto.CreateDepartmentRequest;
import com.hospital.dto.DepartmentDto;
import com.hospital.entity.Department;
import com.hospital.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<DepartmentDto> getActiveDepartments() {
        return departmentRepository.findByIsActiveTrue().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request, UUID adminUserId) {
        Department dept = Department.builder()
                .name(request.getName().trim())
                .description(request.getDescription().trim())
                .isActive(true)
                .build();

        dept = departmentRepository.save(dept);

        auditLogService.log(adminUserId, "CREATE_DEPARTMENT", "Department", dept.getId(), "Created department " + dept.getName());

        return mapToDto(dept);
    }

    public DepartmentDto mapToDto(Department dept) {
        return DepartmentDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .isActive(dept.getIsActive())
                .build();
    }
}
