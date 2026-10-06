package com.hospital.service;

import com.hospital.dto.CreateLabOrderRequest;
import com.hospital.dto.LabOrderDto;
import com.hospital.dto.UpdateLabResultRequest;
import com.hospital.entity.*;
import com.hospital.exception.ForbiddenException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.LabOrderRepository;
import com.hospital.repository.PatientProfileRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabService {

    private final LabOrderRepository labOrderRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public LabOrderDto createLabOrder(UUID appointmentId, CreateLabOrderRequest request, UserPrincipal principal) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        User doctor = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user not found"));

        String orderNumber = "LAB-" + System.currentTimeMillis() % 1000000 + "-" +
                UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        String category = request.getTestCategory() != null && !request.getTestCategory().isBlank()
                ? request.getTestCategory()
                : "Biochemistry & Pathology";

        String sample = request.getSampleType() != null && !request.getSampleType().isBlank()
                ? request.getSampleType()
                : "Blood";

        LabOrder order = LabOrder.builder()
                .orderNumber(orderNumber)
                .appointment(appointment)
                .patient(appointment.getPatient())
                .orderingDoctor(doctor)
                .testName(request.getTestName().trim())
                .testCategory(category)
                .sampleType(sample)
                .status(LabOrderStatus.REQUESTED)
                .clinicalNotes(request.getClinicalNotes())
                .build();

        order = labOrderRepository.save(order);

        auditLogService.log(
                doctor.getId(),
                "LAB_TEST_ORDERED",
                "LabOrder",
                order.getId(),
                "Ordered lab test: " + order.getTestName() + " for patient " + appointment.getPatient().getFullName()
        );

        return toDto(order);
    }

    @Transactional(readOnly = true)
    public List<LabOrderDto> getLabOrdersForAppointment(UUID appointmentId, UserPrincipal principal) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        validateAccess(appointment.getPatient().getId(), appointment.getDoctor().getId(), principal);

        return labOrderRepository.findByAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LabOrderDto> getLabOrdersForPatient(UUID patientId, UserPrincipal principal) {
        if (principal.getRole() == Role.PATIENT && !principal.getId().equals(patientId)) {
            throw new ForbiddenException("Cannot view lab orders for another patient.");
        }

        return labOrderRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public LabOrderDto updateLabResult(UUID orderId, UpdateLabResultRequest request, UserPrincipal principal) {
        LabOrder order = labOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with ID: " + orderId));

        order.setResultValue(request.getResultValue().trim());
        order.setReferenceRange(request.getReferenceRange() != null ? request.getReferenceRange().trim() : null);
        order.setInterpretation(request.getInterpretation() != null ? request.getInterpretation().trim() : "NORMAL");
        order.setTechnicianRemarks(request.getTechnicianRemarks() != null ? request.getTechnicianRemarks().trim() : null);
        order.setStatus(LabOrderStatus.COMPLETED);
        order.setCompletedAt(Instant.now());

        order = labOrderRepository.save(order);

        auditLogService.log(
                principal.getId(),
                "LAB_RESULT_RECORDED",
                "LabOrder",
                order.getId(),
                "Recorded results for: " + order.getTestName()
        );

        return toDto(order);
    }

    private void validateAccess(UUID patientId, UUID doctorId, UserPrincipal principal) {
        if (principal.getRole() == Role.PATIENT && !principal.getId().equals(patientId)) {
            throw new ForbiddenException("Access denied.");
        }
        if (principal.getRole() == Role.DOCTOR && !principal.getId().equals(doctorId)) {
            throw new ForbiddenException("Access denied.");
        }
    }

    private LabOrderDto toDto(LabOrder order) {
        String patientCode = patientProfileRepository.findById(order.getPatient().getId())
                .map(PatientProfile::getPatientCode)
                .orElse("—");

        return LabOrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .appointmentId(order.getAppointment() != null ? order.getAppointment().getId() : null)
                .patientId(order.getPatient().getId())
                .patientName(order.getPatient().getFullName())
                .patientCode(patientCode)
                .doctorName(order.getOrderingDoctor().getFullName())
                .testName(order.getTestName())
                .testCategory(order.getTestCategory())
                .sampleType(order.getSampleType())
                .status(order.getStatus().name())
                .clinicalNotes(order.getClinicalNotes())
                .resultValue(order.getResultValue())
                .referenceRange(order.getReferenceRange())
                .interpretation(order.getInterpretation())
                .technicianRemarks(order.getTechnicianRemarks())
                .completedAt(order.getCompletedAt())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
