package com.hospital.repository;

import com.hospital.entity.ConsultationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConsultationNoteRepository extends JpaRepository<ConsultationNote, UUID> {
    List<ConsultationNote> findByAppointmentId(UUID appointmentId);
    List<ConsultationNote> findByPatientId(UUID patientId);
}
