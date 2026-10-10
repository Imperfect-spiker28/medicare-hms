package com.hospital.repository;

import com.hospital.entity.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, UUID> {
    List<DoctorLeave> findByDoctorProfileUserId(UUID doctorId);
    List<DoctorLeave> findByDoctorProfileUserIdIn(List<UUID> doctorIds);
    boolean existsByDoctorProfileUserIdAndLeaveDate(UUID doctorId, LocalDate leaveDate);
}
