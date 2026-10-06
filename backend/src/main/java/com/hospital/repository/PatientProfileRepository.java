package com.hospital.repository;

import com.hospital.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, UUID> {
    Optional<PatientProfile> findByPatientCode(String patientCode);

    @Query("SELECT p FROM PatientProfile p JOIN p.user u WHERE " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "u.phone LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.patientCode) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<PatientProfile> searchPatients(@Param("query") String query);
}
