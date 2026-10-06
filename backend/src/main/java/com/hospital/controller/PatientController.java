package com.hospital.controller;

import com.hospital.dto.PatientDetailResponse;
import com.hospital.dto.PatientSummaryDto;
import com.hospital.security.UserPrincipal;
import com.hospital.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<Map<String, List<PatientSummaryDto>>> searchPatients(
            @RequestParam(required = false) String q
    ) {
        List<PatientSummaryDto> patients = patientService.searchPatients(q);
        return ResponseEntity.ok(Map.of("patients", patients));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDetailResponse> getPatientDetails(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        PatientDetailResponse response = patientService.getPatientDetails(id, principal);
        return ResponseEntity.ok(response);
    }
}
