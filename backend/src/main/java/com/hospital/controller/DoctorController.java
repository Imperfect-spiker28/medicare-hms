package com.hospital.controller;

import com.hospital.dto.DoctorDto;
import com.hospital.dto.SlotDto;
import com.hospital.exception.BadRequestException;
import com.hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<Map<String, List<DoctorDto>>> getDoctors(
            @RequestParam(required = false) UUID departmentId
    ) {
        List<DoctorDto> doctors = doctorService.getDoctors(departmentId);
        return ResponseEntity.ok(Map.of("doctors", doctors));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<Map<String, List<SlotDto>>> getSlots(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        if (date == null) {
            throw new BadRequestException("A valid ?date=YYYY-MM-DD is required.");
        }
        List<SlotDto> slots = doctorService.getDoctorSlots(id, date);
        return ResponseEntity.ok(Map.of("slots", slots));
    }
}
