package com.hospital.repository;

import com.hospital.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    
    @Query("SELECT DISTINCT p FROM Prescription p LEFT JOIN FETCH p.items WHERE p.appointment.id = :appointmentId")
    List<Prescription> findByAppointmentIdWithItems(@Param("appointmentId") UUID appointmentId);

    @Query("SELECT DISTINCT p FROM Prescription p LEFT JOIN FETCH p.items WHERE p.patient.id = :patientId ORDER BY p.createdAt DESC")
    List<Prescription> findByPatientIdWithItems(@Param("patientId") UUID patientId);
}
