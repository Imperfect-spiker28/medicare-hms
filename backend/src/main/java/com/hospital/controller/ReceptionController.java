package com.hospital.controller;

import com.hospital.dto.PatientSummaryDto;
import com.hospital.dto.WalkInPatientRequest;
import com.hospital.security.UserPrincipal;
import com.hospital.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reception")
@RequiredArgsConstructor
public class ReceptionController {

    private final PatientService patientService;

    @PostMapping("/walkin")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Map<String, PatientSummaryDto>> registerWalkIn(
            @Valid @RequestBody WalkInPatientRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        PatientSummaryDto patient = patientService.registerWalkIn(request, principal.getId());
        return ResponseEntity.ok(Map.of("patient", patient));
    }
}
