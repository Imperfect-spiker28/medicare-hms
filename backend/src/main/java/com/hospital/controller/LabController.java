package com.hospital.controller;

import com.hospital.dto.CreateLabOrderRequest;
import com.hospital.dto.LabOrderDto;
import com.hospital.dto.UpdateLabResultRequest;
import com.hospital.security.UserPrincipal;
import com.hospital.service.LabService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/labs")
@RequiredArgsConstructor
public class LabController {

    private final LabService labService;

    @PostMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, LabOrderDto>> createLabOrder(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody CreateLabOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        LabOrderDto order = labService.createLabOrder(appointmentId, request, principal);
        return ResponseEntity.ok(Map.of("order", order));
    }

    @GetMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, List<LabOrderDto>>> getLabOrdersForAppointment(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<LabOrderDto> orders = labService.getLabOrdersForAppointment(appointmentId, principal);
        return ResponseEntity.ok(Map.of("orders", orders));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, List<LabOrderDto>>> getMyLabOrders(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<LabOrderDto> orders = labService.getLabOrdersForPatient(principal.getId(), principal);
        return ResponseEntity.ok(Map.of("orders", orders));
    }

    @GetMapping("/patients/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, List<LabOrderDto>>> getLabOrdersForPatient(
            @PathVariable UUID patientId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<LabOrderDto> orders = labService.getLabOrdersForPatient(patientId, principal);
        return ResponseEntity.ok(Map.of("orders", orders));
    }

    @PatchMapping("/orders/{orderId}/result")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, LabOrderDto>> updateLabResult(
            @PathVariable UUID orderId,
            @Valid @RequestBody UpdateLabResultRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        LabOrderDto order = labService.updateLabResult(orderId, request, principal);
        return ResponseEntity.ok(Map.of("order", order));
    }
}
