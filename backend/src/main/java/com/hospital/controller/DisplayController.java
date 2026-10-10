package com.hospital.controller;

import com.hospital.dto.DisplayQueueDto;
import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.DoctorProfile;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/display")
@RequiredArgsConstructor
public class DisplayController {

    private final DoctorProfileRepository doctorProfileRepository;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/queue")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getLiveQueue(
            @RequestParam(required = false) String date
    ) {
        LocalDate targetDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        List<DoctorProfile> doctors = doctorProfileRepository.findAllActiveWithDetails();
        List<Appointment> todaysAppointments = appointmentRepository.findByDateOrderByStartTimeAsc(targetDate);

        Map<UUID, List<Appointment>> apptsByDoctor = new HashMap<>();
        for (Appointment a : todaysAppointments) {
            apptsByDoctor.computeIfAbsent(a.getDoctor().getId(), k -> new ArrayList<>()).add(a);
        }

        List<DisplayQueueDto> queueList = new ArrayList<>();
        int roomCounter = 101;

        for (DoctorProfile doc : doctors) {
            UUID docId = doc.getUserId();
            List<Appointment> docAppts = apptsByDoctor.getOrDefault(docId, Collections.emptyList());

            // Find current in consultation
            Appointment currentAppt = docAppts.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.IN_CONSULTATION)
                    .findFirst()
                    .orElse(null);

            // Waiting tokens (Checked in or confirmed)
            List<Integer> waiting = docAppts.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.CHECKED_IN || a.getStatus() == AppointmentStatus.CONFIRMED)
                    .map(Appointment::getTokenNumber)
                    .toList();

            int completedCount = (int) docAppts.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .count();

            Integer currentToken = currentAppt != null ? currentAppt.getTokenNumber() : (!waiting.isEmpty() ? waiting.get(0) : null);
            String currentStatus = currentAppt != null ? "IN_CONSULTATION" : (!waiting.isEmpty() ? "CALLING" : "IDLE");

            queueList.add(DisplayQueueDto.builder()
                    .doctorId(docId)
                    .doctorName(doc.getUser().getFullName())
                    .departmentName(doc.getDepartment() != null ? doc.getDepartment().getName() : "General")
                    .roomNumber("Room " + roomCounter++)
                    .currentToken(currentToken)
                    .currentStatus(currentStatus)
                    .waitingTokens(waiting.size() > 5 ? waiting.subList(0, 5) : waiting)
                    .totalCompletedToday(completedCount)
                    .build());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("date", targetDate.toString());
        response.put("hospitalName", "Medicare Hospital, Irinjalakuda");
        response.put("queues", queueList);

        return ResponseEntity.ok(response);
    }
}
