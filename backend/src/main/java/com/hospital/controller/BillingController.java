package com.hospital.controller;

import com.hospital.dto.ConsultationBillDto;
import com.hospital.dto.PayBillRequest;
import com.hospital.security.UserPrincipal;
import com.hospital.service.BillingService;
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
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Map<String, ConsultationBillDto>> getBillForAppointment(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ConsultationBillDto bill = billingService.getOrCreateBillForAppointment(appointmentId, principal);
        return ResponseEntity.ok(Map.of("bill", bill));
    }

    @PostMapping("/appointments/{appointmentId}/pay")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Map<String, ConsultationBillDto>> payBill(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody PayBillRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ConsultationBillDto bill = billingService.recordPayment(appointmentId, request, principal);
        return ResponseEntity.ok(Map.of("bill", bill));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, List<ConsultationBillDto>>> getPatientBills(
            @PathVariable UUID patientId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ConsultationBillDto> bills = billingService.getPatientBills(patientId, principal);
        return ResponseEntity.ok(Map.of("bills", bills));
    }
}
