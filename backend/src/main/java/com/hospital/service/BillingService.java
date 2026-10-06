package com.hospital.service;

import com.hospital.dto.ConsultationBillDto;
import com.hospital.dto.PayBillRequest;
import com.hospital.entity.*;
import com.hospital.exception.ForbiddenException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.ConsultationBillRepository;
import com.hospital.repository.PatientProfileRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final ConsultationBillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final AuditLogService auditLogService;

    private static final BigDecimal DEFAULT_OPD_FEE = new BigDecimal("500.00");

    @Transactional
    public ConsultationBillDto getOrCreateBillForAppointment(UUID appointmentId, UserPrincipal principal) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        validateBillAccess(appointment, principal);

        ConsultationBill bill = billRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> createInitialBill(appointment));

        return toDto(bill);
    }

    @Transactional
    public ConsultationBillDto recordPayment(UUID appointmentId, PayBillRequest request, UserPrincipal principal) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        ConsultationBill bill = billRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> createInitialBill(appointment));

        User cashier = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cashier user not found"));

        if (request.getAmount() != null && request.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            bill.setTotalAmount(request.getAmount());
            bill.setConsultationFee(request.getAmount());
        }

        PaymentMethod method = PaymentMethod.CASH;
        if (request.getPaymentMethod() != null) {
            try {
                method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        bill.setPaymentMethod(method);
        bill.setPaymentStatus(PaymentStatus.PAID);
        bill.setTransactionReference(request.getTransactionReference());
        bill.setNotes(request.getNotes());
        bill.setCashier(cashier);
        bill.setPaidAt(Instant.now());

        bill = billRepository.save(bill);

        auditLogService.log(
                principal.getId(),
                "OPD_FEE_PAID",
                "ConsultationBill",
                bill.getId(),
                "Collected OPD fee: " + bill.getTotalAmount() + " via " + bill.getPaymentMethod()
        );

        return toDto(bill);
    }

    @Transactional(readOnly = true)
    public List<ConsultationBillDto> getPatientBills(UUID patientId, UserPrincipal principal) {
        if (principal.getRole() == Role.PATIENT && !principal.getId().equals(patientId)) {
            throw new ForbiddenException("Cannot view billing for other patients.");
        }
        return billRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private ConsultationBill createInitialBill(Appointment appointment) {
        String billNumber = "MED-" + appointment.getDate().getYear() + "-" +
                String.format("%04d", appointment.getTokenNumber()) + "-" +
                UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        ConsultationBill bill = ConsultationBill.builder()
                .billNumber(billNumber)
                .appointment(appointment)
                .patient(appointment.getPatient())
                .consultationFee(DEFAULT_OPD_FEE)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(DEFAULT_OPD_FEE)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        return billRepository.save(bill);
    }

    private void validateBillAccess(Appointment appointment, UserPrincipal principal) {
        if (principal.getRole() == Role.PATIENT && !appointment.getPatient().getId().equals(principal.getId())) {
            throw new ForbiddenException("Access denied to view this consultation bill.");
        }
        if (principal.getRole() == Role.DOCTOR && !appointment.getDoctor().getId().equals(principal.getId())) {
            throw new ForbiddenException("Access denied to view this consultation bill.");
        }
    }

    private ConsultationBillDto toDto(ConsultationBill bill) {
        Appointment appt = bill.getAppointment();
        String patientCode = patientProfileRepository.findById(bill.getPatient().getId())
                .map(PatientProfile::getPatientCode)
                .orElse("—");

        return ConsultationBillDto.builder()
                .id(bill.getId())
                .billNumber(bill.getBillNumber())
                .appointmentId(appt.getId())
                .tokenNumber(appt.getTokenNumber())
                .appointmentDate(appt.getDate())
                .appointmentTime(appt.getStartTime())
                .patientId(bill.getPatient().getId())
                .patientName(bill.getPatient().getFullName())
                .patientPhone(bill.getPatient().getPhone())
                .patientCode(patientCode)
                .doctorName(appt.getDoctor().getFullName())
                .departmentName(appt.getDepartment().getName())
                .consultationFee(bill.getConsultationFee())
                .taxAmount(bill.getTaxAmount())
                .totalAmount(bill.getTotalAmount())
                .paymentStatus(bill.getPaymentStatus().name())
                .paymentMethod(bill.getPaymentMethod() != null ? bill.getPaymentMethod().name() : null)
                .transactionReference(bill.getTransactionReference())
                .cashierName(bill.getCashier() != null ? bill.getCashier().getFullName() : null)
                .paidAt(bill.getPaidAt())
                .createdAt(bill.getCreatedAt())
                .build();
    }
}
