package com.hospital.repository;

import com.hospital.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    List<DoctorProfile> findByDepartmentId(UUID departmentId);

    @Query("SELECT d FROM DoctorProfile d JOIN FETCH d.user u LEFT JOIN FETCH d.department dept WHERE u.isActive = true")
    List<DoctorProfile> findAllActiveWithDetails();

    @Query("SELECT d FROM DoctorProfile d JOIN FETCH d.user u LEFT JOIN FETCH d.department dept WHERE u.isActive = true AND d.department.id = :deptId")
    List<DoctorProfile> findActiveByDepartmentId(@Param("deptId") UUID deptId);

    @Query("SELECT d FROM DoctorProfile d LEFT JOIN FETCH d.availability WHERE d.userId = :id")
    Optional<DoctorProfile> findByIdWithAvailability(@Param("id") UUID id);
}
