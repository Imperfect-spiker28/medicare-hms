package com.hospital.repository;

import com.hospital.entity.PatientVitals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientVitalsRepository extends JpaRepository<PatientVitals, UUID> {
    List<PatientVitals> findByAppointmentIdOrderByRecordedAtDesc(UUID appointmentId);
    List<PatientVitals> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
    Optional<PatientVitals> findFirstByAppointmentIdOrderByRecordedAtDesc(UUID appointmentId);
}
