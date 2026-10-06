package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.security.UserPrincipal;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<Map<String, List<AppointmentDto>>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<AppointmentDto> appointments = appointmentService.getAppointments(principal, date);
        return ResponseEntity.ok(Map.of("appointments", appointments));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Map<String, AppointmentDto>> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        AppointmentDto appointment = appointmentService.bookAppointment(request, principal);
        return ResponseEntity.ok(Map.of("appointment", appointment));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, AppointmentDto>> patchAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody PatchAppointmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        AppointmentDto appointment = appointmentService.patchAppointment(id, request, principal);
        return ResponseEntity.ok(Map.of("appointment", appointment));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<Map<String, AppointmentDto>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        AppointmentDto appointment = appointmentService.updateStatus(id, request, principal);
        return ResponseEntity.ok(Map.of("appointment", appointment));
    }

    @GetMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, List<ConsultationNoteDto>>> getNotes(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ConsultationNoteDto> notes = appointmentService.getNotes(id, principal);
        return ResponseEntity.ok(Map.of("notes", notes));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, ConsultationNoteDto>> addNote(
            @PathVariable UUID id,
            @Valid @RequestBody ConsultationNoteRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ConsultationNoteDto note = appointmentService.addNote(id, request, principal);
        return ResponseEntity.ok(Map.of("note", note));
    }

    @GetMapping("/{id}/prescription")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, List<PrescriptionDto>>> getPrescriptions(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<PrescriptionDto> prescriptions = appointmentService.getPrescriptions(id, principal);
        return ResponseEntity.ok(Map.of("prescriptions", prescriptions));
    }

    @PostMapping("/{id}/prescription")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, PrescriptionDto>> addPrescription(
            @PathVariable UUID id,
            @Valid @RequestBody PrescriptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        PrescriptionDto prescription = appointmentService.addPrescription(id, request, principal);
        return ResponseEntity.ok(Map.of("prescription", prescription));
    }
}
