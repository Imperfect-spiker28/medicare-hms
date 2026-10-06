package com.hospital.repository;

import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatientIdOrderByDateAscStartTimeAsc(UUID patientId);

    List<Appointment> findByDoctorIdOrderByDateAscStartTimeAsc(UUID doctorId);

    List<Appointment> findAllByOrderByDateAscStartTimeAsc();

    List<Appointment> findByDateOrderByStartTimeAsc(LocalDate date);

    List<Appointment> findByPatientIdAndDateOrderByStartTimeAsc(UUID patientId, LocalDate date);

    List<Appointment> findByDoctorIdAndDateOrderByStartTimeAsc(UUID doctorId, LocalDate date);

    List<Appointment> findByDoctorIdAndDateAndStatusNotIn(UUID doctorId, LocalDate date, Collection<AppointmentStatus> statuses);

    long countByDoctorIdAndDateAndStatusNot(UUID doctorId, LocalDate date, AppointmentStatus status);

    boolean existsByDoctorIdAndDateAndStartTimeAndStatusNotIn(UUID doctorId, LocalDate date, LocalTime startTime, Collection<AppointmentStatus> statuses);

    Optional<Appointment> findByDoctorIdAndDateAndStartTime(UUID doctorId, LocalDate date, LocalTime startTime);

    long countByDate(LocalDate date);

    long countByStatus(AppointmentStatus status);

    long countByDepartmentId(UUID departmentId);

    @Query("SELECT a.status, COUNT(a) FROM Appointment a GROUP BY a.status")
    List<Object[]> countAppointmentsByStatusGroup();

    @Query("SELECT a.date, COUNT(a) FROM Appointment a WHERE a.date BETWEEN :startDate AND :endDate GROUP BY a.date ORDER BY a.date ASC")
    List<Object[]> countAppointmentsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
