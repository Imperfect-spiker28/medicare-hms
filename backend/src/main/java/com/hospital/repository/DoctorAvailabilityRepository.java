package com.hospital.repository;

import com.hospital.entity.DoctorAvailability;
import com.hospital.entity.DoctorDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, UUID> {
    List<DoctorAvailability> findByDoctorProfileUserId(UUID doctorId);
    List<DoctorAvailability> findByDoctorProfileUserIdIn(List<UUID> doctorIds);
    List<DoctorAvailability> findByDoctorProfileUserIdAndDay(UUID doctorId, DoctorDay day);
}
