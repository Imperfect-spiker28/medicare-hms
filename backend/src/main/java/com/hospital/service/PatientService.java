package com.hospital.service;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.exception.ForbiddenException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import com.hospital.security.UserPrincipal;
import com.hospital.util.DateTimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationNoteRepository consultationNoteRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<PatientSummaryDto> searchPatients(String query) {
        List<PatientProfile> profiles;
        if (query != null && !query.trim().isEmpty()) {
            profiles = patientProfileRepository.searchPatients(query.trim());
        } else {
            profiles = patientProfileRepository.findAll();
        }

        return profiles.stream()
                .limit(25)
                .map(p -> PatientSummaryDto.builder()
                        .id(p.getUser().getId())
                        .fullName(p.getUser().getFullName())
                        .phone(p.getUser().getPhone())
                        .email(p.getUser().getEmail())
                        .patientCode(p.getPatientCode())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientDetailResponse getPatientDetails(UUID patientId, UserPrincipal principal) {
        boolean isSelf = principal.getRole() == Role.PATIENT && principal.getId().equals(patientId);
        boolean isStaff = principal.getRole() == Role.DOCTOR || principal.getRole() == Role.RECEPTIONIST || principal.getRole() == Role.ADMIN;

        if (!isSelf && !isStaff) {
            throw new ForbiddenException("Not authorized.");
        }

        User user = userRepository.findById(patientId)
                .filter(u -> u.getRole() == Role.PATIENT)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));

        PatientProfile profile = patientProfileRepository.findById(patientId).orElse(null);

        List<AppointmentDto> appointments = appointmentRepository.findByPatientIdOrderByDateAscStartTimeAsc(patientId).stream()
                .map(this::mapAppointmentToDto)
                .toList();

        List<ConsultationNoteDto> notes = consultationNoteRepository.findByPatientId(patientId).stream()
                .map(n -> ConsultationNoteDto.builder()
                        .id(n.getId())
                        .appointmentId(n.getAppointment().getId())
                        .doctorId(n.getDoctor().getId())
                        .patientId(n.getPatient().getId())
                        .diagnosis(n.getDiagnosis())
                        .notes(n.getNotes())
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();

        List<PrescriptionDto> prescriptions = prescriptionRepository.findByPatientIdWithItems(patientId).stream()
                .map(this::mapPrescriptionToDto)
                .toList();

        PatientDetailResponse.PatientRecordDto patientRecord = PatientDetailResponse.PatientRecordDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .patientCode(profile != null ? profile.getPatientCode() : null)
                .address(profile != null ? profile.getAddress() : null)
                .bloodGroup(profile != null ? profile.getBloodGroup() : null)
                .emergencyContactName(profile != null ? profile.getEmergencyContactName() : null)
                .emergencyContactPhone(profile != null ? profile.getEmergencyContactPhone() : null)
                .allergies(profile != null ? profile.getAllergies() : null)
                .chronicConditions(profile != null ? profile.getChronicConditions() : null)
                .insuranceProvider(profile != null ? profile.getInsuranceProvider() : null)
                .insurancePolicyNo(profile != null ? profile.getInsurancePolicyNo() : null)
                .build();

        return PatientDetailResponse.builder()
                .patient(patientRecord)
                .appointments(appointments)
                .notes(notes)
                .prescriptions(prescriptions)
                .build();
    }

    @Transactional
    public PatientSummaryDto registerWalkIn(WalkInPatientRequest request, UUID staffUserId) {
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            email = "walkin." + System.currentTimeMillis() + "@medicarehospital.in";
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 10);

        User user = User.builder()
                .role(Role.PATIENT)
                .email(email)
                .passwordHash(passwordEncoder.encode(tempPassword))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        long count = patientProfileRepository.count() + 1;
        String patientCode = String.format("MCH-%d-%06d", Year.now().getValue(), count);

        PatientProfile profile = PatientProfile.builder()
                .user(user)
                .patientCode(patientCode)
                .address(request.getAddress())
                .build();

        patientProfileRepository.save(profile);

        auditLogService.log(staffUserId, "REGISTER_WALKIN", "User", user.getId(), "Walk-in patient registered: " + user.getFullName());

        return PatientSummaryDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .patientCode(patientCode)
                .build();
    }

    private AppointmentDto mapAppointmentToDto(Appointment a) {
        return AppointmentDto.builder()
                .id(a.getId())
                .tokenNumber(a.getTokenNumber())
                .patientId(a.getPatient().getId())
                .doctorId(a.getDoctor().getId())
                .departmentId(a.getDepartment().getId())
                .date(a.getDate())
                .startTime(DateTimeUtil.formatTime(a.getStartTime()))
                .endTime(DateTimeUtil.formatTime(a.getEndTime()))
                .type(a.getType())
                .status(a.getStatus())
                .reasonForVisit(a.getReasonForVisit())
                .createdBy(a.getCreatedBy().getId())
                .cancelReason(a.getCancelReason())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .patientName(a.getPatient().getFullName())
                .patientPhone(a.getPatient().getPhone())
                .doctorName(a.getDoctor().getFullName())
                .departmentName(a.getDepartment().getName())
                .build();
    }

    private PrescriptionDto mapPrescriptionToDto(Prescription p) {
        List<PrescriptionItemDto> items = p.getItems().stream()
                .map(item -> PrescriptionItemDto.builder()
                        .id(item.getId())
                        .medicine(item.getMedicine())
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .durationDays(item.getDurationDays())
                        .instructions(item.getInstructions())
                        .build())
                .toList();

        return PrescriptionDto.builder()
                .id(p.getId())
                .appointmentId(p.getAppointment().getId())
                .doctorId(p.getDoctor().getId())
                .patientId(p.getPatient().getId())
                .items(items)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
