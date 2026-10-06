package com.hospital.repository;

import com.hospital.entity.LabOrder;
import com.hospital.entity.LabOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LabOrderRepository extends JpaRepository<LabOrder, UUID> {
    List<LabOrder> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<LabOrder> findByAppointmentIdOrderByCreatedAtDesc(UUID appointmentId);
    List<LabOrder> findByStatusOrderByCreatedAtDesc(LabOrderStatus status);
}
