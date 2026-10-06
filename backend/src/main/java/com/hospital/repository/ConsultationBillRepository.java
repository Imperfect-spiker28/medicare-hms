package com.hospital.repository;

import com.hospital.entity.ConsultationBill;
import com.hospital.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsultationBillRepository extends JpaRepository<ConsultationBill, UUID> {
    Optional<ConsultationBill> findByAppointmentId(UUID appointmentId);
    List<ConsultationBill> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<ConsultationBill> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus);
}
