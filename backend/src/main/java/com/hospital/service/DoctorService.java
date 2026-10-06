package com.hospital.service;

import com.hospital.dto.CreateDoctorRequest;
import com.hospital.dto.DepartmentDto;
import com.hospital.dto.DoctorAvailabilityDto;
import com.hospital.dto.DoctorDto;
import com.hospital.dto.SlotDto;
import com.hospital.entity.*;
import com.hospital.exception.ConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import com.hospital.util.DateTimeUtil;
import com.hospital.util.SchedulingEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;
    private final AppointmentRepository appointmentRepository;
    private final SchedulingEngine schedulingEngine;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<DoctorDto> getDoctors(UUID departmentId) {
        List<DoctorProfile> profiles = (departmentId != null)
                ? doctorProfileRepository.findActiveByDepartmentId(departmentId)
                : doctorProfileRepository.findAllActiveWithDetails();

        return profiles.stream()
                .map(this::mapToPublicDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SlotDto> getDoctorSlots(UUID doctorId, LocalDate date) {
        DoctorProfile profile = doctorProfileRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found."));

        boolean isOnLeave = leaveRepository.existsByDoctorProfileUserIdAndLeaveDate(doctorId, date);
        List<DoctorAvailability> availability = availabilityRepository.findByDoctorProfileUserId(doctorId);
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndDateOrderByStartTimeAsc(doctorId, date);

        return schedulingEngine.generateSlots(date, isOnLeave, availability, appointments);
    }

    @Transactional(readOnly = true)
    public List<DoctorDto> getAllDoctorsForAdmin() {
        return doctorProfileRepository.findAll().stream()
                .map(this::mapToAdminDto)
                .toList();
    }

    @Transactional
    public DoctorDto createDoctor(CreateDoctorRequest request, UUID adminUserId) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("A user with this email already exists.");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));

        User user = User.builder()
                .role(Role.DOCTOR)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        DoctorProfile profile = DoctorProfile.builder()
                .user(user)
                .department(department)
                .specialization(request.getSpecialization().trim())
                .qualification(request.getQualification().trim())
                .registrationNo(request.getRegistrationNo().trim())
                .consultationFee(request.getConsultationFee())
                .yearsExperience(request.getYearsExperience())
                .bio(request.getBio())
                .availability(new ArrayList<>())
                .leaves(new ArrayList<>())
                .build();

        profile = doctorProfileRepository.save(profile);

        // Add default schedule (Mon-Fri 09:00 - 13:00, 15 min slots)
        DoctorDay[] days = {DoctorDay.MON, DoctorDay.TUE, DoctorDay.WED, DoctorDay.THU, DoctorDay.FRI};
        List<DoctorAvailability> defaultAvail = new ArrayList<>();
        for (DoctorDay day : days) {
            defaultAvail.add(DoctorAvailability.builder()
                    .doctorProfile(profile)
                    .day(day)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(13, 0))
                    .slotMinutes(15)
                    .build());
        }
        availabilityRepository.saveAll(defaultAvail);
        profile.setAvailability(defaultAvail);

        auditLogService.log(adminUserId, "CREATE_DOCTOR", "Doctor", user.getId(), "Registered doctor " + user.getFullName());

        return mapToAdminDto(profile);
    }

    private DoctorDto mapToPublicDto(DoctorProfile profile) {
        List<DoctorAvailabilityDto> availDtos = profile.getAvailability().stream()
                .map(a -> DoctorAvailabilityDto.builder()
                        .day(a.getDay())
                        .startTime(DateTimeUtil.formatTime(a.getStartTime()))
                        .endTime(DateTimeUtil.formatTime(a.getEndTime()))
                        .slotMinutes(a.getSlotMinutes())
                        .build())
                .toList();

        DepartmentDto deptDto = profile.getDepartment() != null
                ? DepartmentDto.builder()
                .id(profile.getDepartment().getId())
                .name(profile.getDepartment().getName())
                .build()
                : null;

        return DoctorDto.builder()
                .id(profile.getUser().getId())
                .fullName(profile.getUser().getFullName())
                .department(deptDto)
                .specialization(profile.getSpecialization())
                .qualification(profile.getQualification())
                .consultationFee(profile.getConsultationFee())
                .yearsExperience(profile.getYearsExperience())
                .bio(profile.getBio())
                .availability(availDtos)
                .build();
    }

    private DoctorDto mapToAdminDto(DoctorProfile profile) {
        List<DoctorAvailabilityDto> availDtos = availabilityRepository.findByDoctorProfileUserId(profile.getUserId()).stream()
                .map(a -> DoctorAvailabilityDto.builder()
                        .day(a.getDay())
                        .startTime(DateTimeUtil.formatTime(a.getStartTime()))
                        .endTime(DateTimeUtil.formatTime(a.getEndTime()))
                        .slotMinutes(a.getSlotMinutes())
                        .build())
                .toList();

        List<String> leaves = leaveRepository.findByDoctorProfileUserId(profile.getUserId()).stream()
                .map(l -> l.getLeaveDate().toString())
                .toList();

        return DoctorDto.builder()
                .userId(profile.getUser().getId())
                .id(profile.getUser().getId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .isActive(profile.getUser().getIsActive())
                .departmentId(profile.getDepartment() != null ? profile.getDepartment().getId() : null)
                .departmentName(profile.getDepartment() != null ? profile.getDepartment().getName() : null)
                .specialization(profile.getSpecialization())
                .qualification(profile.getQualification())
                .registrationNo(profile.getRegistrationNo())
                .consultationFee(profile.getConsultationFee())
                .yearsExperience(profile.getYearsExperience())
                .bio(profile.getBio())
                .availability(availDtos)
                .onLeaveDates(leaves)
                .build();
    }
}
