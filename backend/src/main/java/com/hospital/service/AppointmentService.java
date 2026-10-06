package com.hospital.service;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ConflictException;
import com.hospital.exception.ForbiddenException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import com.hospital.security.UserPrincipal;
import com.hospital.util.DateTimeUtil;
import com.hospital.util.SchedulingEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final ConsultationNoteRepository consultationNoteRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;
    private final PatientVitalsRepository patientVitalsRepository;
    private final SchedulingEngine schedulingEngine;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointments(UserPrincipal principal, LocalDate dateFilter) {
        List<Appointment> list;

        if (principal.getRole() == Role.PATIENT) {
            list = (dateFilter != null)
                    ? appointmentRepository.findByPatientIdAndDateOrderByStartTimeAsc(principal.getId(), dateFilter)
                    : appointmentRepository.findByPatientIdOrderByDateAscStartTimeAsc(principal.getId());
        } else if (principal.getRole() == Role.DOCTOR) {
            list = (dateFilter != null)
                    ? appointmentRepository.findByDoctorIdAndDateOrderByStartTimeAsc(principal.getId(), dateFilter)
                    : appointmentRepository.findByDoctorIdOrderByDateAscStartTimeAsc(principal.getId());
        } else {
            // ADMIN and RECEPTIONIST see all
            list = (dateFilter != null)
                    ? appointmentRepository.findByDateOrderByStartTimeAsc(dateFilter)
                    : appointmentRepository.findAllByOrderByDateAscStartTimeAsc();
        }

        return list.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AppointmentDto bookAppointment(CreateAppointmentRequest request, UserPrincipal principal) {
        if (principal.getRole() != Role.PATIENT && principal.getRole() != Role.RECEPTIONIST && principal.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Not authorized to book appointments.");
        }

        UUID patientId = (principal.getRole() == Role.PATIENT)
                ? principal.getId()
                : request.getPatientId();

        if (patientId == null) {
            throw new BadRequestException("patientId is required when booking on behalf of a patient.");
        }

        User patient = userRepository.findById(patientId)
                .filter(u -> u.getRole() == Role.PATIENT)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));

        DoctorProfile doctorProfile = doctorProfileRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found."));

        AppointmentType type = request.getType() != null ? request.getType() : AppointmentType.ONLINE;
        if (principal.getRole() == Role.RECEPTIONIST && type == AppointmentType.ONLINE) {
            type = AppointmentType.WALK_IN;
        }

        LocalTime startTime = DateTimeUtil.parseTime(request.getStartTime());
        LocalDate date = request.getDate();

        // Check slots
        boolean onLeave = leaveRepository.existsByDoctorProfileUserIdAndLeaveDate(request.getDoctorId(), date);
        List<DoctorAvailability> availabilities = availabilityRepository.findByDoctorProfileUserId(request.getDoctorId());
        List<Appointment> existingAppointments = appointmentRepository.findByDoctorIdAndDateOrderByStartTimeAsc(request.getDoctorId(), date);

        List<SlotDto> slots = schedulingEngine.generateSlots(date, onLeave, availabilities, existingAppointments);
        SlotDto targetSlot = slots.stream()
                .filter(s -> s.getStartTime().equals(request.getStartTime()))
                .findFirst()
                .orElseThrow(() -> new ConflictException("That time is outside the doctor's schedule for this date."));

        if (!targetSlot.isAvailable() && type != AppointmentType.EMERGENCY) {
            throw new ConflictException("That slot was just booked by someone else. Please pick another time.");
        }

        // Re-check conflict to prevent race condition
        boolean alreadyBooked = appointmentRepository.existsByDoctorIdAndDateAndStartTimeAndStatusNotIn(
                request.getDoctorId(),
                date,
                startTime,
                Arrays.asList(AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW)
        );
        if (alreadyBooked && type != AppointmentType.EMERGENCY) {
            throw new ConflictException("That slot was just booked by someone else. Please pick another time.");
        }

        int tokenNumber = schedulingEngine.calculateNextTokenNumber(existingAppointments);
        LocalTime endTime = DateTimeUtil.parseTime(targetSlot.getEndTime());

        User bookedBy = userRepository.findById(principal.getId()).orElse(patient);

        Appointment appointment = Appointment.builder()
                .tokenNumber(tokenNumber)
                .patient(patient)
                .doctor(doctorProfile.getUser())
                .department(doctorProfile.getDepartment())
                .date(date)
                .startTime(startTime)
                .endTime(endTime)
                .type(type)
                .status(AppointmentStatus.CONFIRMED)
                .reasonForVisit(request.getReasonForVisit().trim())
                .createdBy(bookedBy)
                .build();

        appointment = appointmentRepository.save(appointment);

        auditLogService.log(principal.getId(), "BOOK_APPOINTMENT", "Appointment", appointment.getId(),
                "Booked token " + tokenNumber + " for " + patient.getFullName() + " with Dr. " + doctorProfile.getUser().getFullName());

        return mapToDto(appointment);
    }

    @Transactional
    public AppointmentDto patchAppointment(UUID id, PatchAppointmentRequest request, UserPrincipal principal) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        boolean isOwner = principal.getRole() == Role.PATIENT && appt.getPatient().getId().equals(principal.getId());
        boolean isStaff = principal.getRole() == Role.RECEPTIONIST || principal.getRole() == Role.ADMIN;

        if (!isOwner && !isStaff) {
            throw new ForbiddenException("Not authorized.");
        }

        if (appt.getStatus() == AppointmentStatus.COMPLETED || appt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new ConflictException("Appointment is already " + appt.getStatus().name().toLowerCase() + ".");
        }

        if ("CANCEL".equalsIgnoreCase(request.getAction())) {
            appt.setStatus(AppointmentStatus.CANCELLED);
            appt.setCancelReason(request.getCancelReason() != null ? request.getCancelReason() : "Cancelled by user");
            appt = appointmentRepository.save(appt);

            auditLogService.log(principal.getId(), "CANCEL_APPOINTMENT", "Appointment", appt.getId(), "Appointment cancelled");
            return mapToDto(appt);
        }

        // RESCHEDULE
        if (request.getDate() == null || request.getStartTime() == null || request.getStartTime().isBlank()) {
            throw new BadRequestException("date and startTime are required to reschedule.");
        }

        LocalDate newDate = request.getDate();
        LocalTime newStartTime = DateTimeUtil.parseTime(request.getStartTime());

        boolean onLeave = leaveRepository.existsByDoctorProfileUserIdAndLeaveDate(appt.getDoctor().getId(), newDate);
        List<DoctorAvailability> avail = availabilityRepository.findByDoctorProfileUserId(appt.getDoctor().getId());
        List<Appointment> existing = appointmentRepository.findByDoctorIdAndDateOrderByStartTimeAsc(appt.getDoctor().getId(), newDate);

        List<SlotDto> slots = schedulingEngine.generateSlots(newDate, onLeave, avail, existing);
        SlotDto slot = slots.stream()
                .filter(s -> s.getStartTime().equals(request.getStartTime()))
                .findFirst()
                .orElseThrow(() -> new ConflictException("That time isn't available."));

        if (!slot.isAvailable()) {
            throw new ConflictException("That time isn't available.");
        }

        appt.setDate(newDate);
        appt.setStartTime(newStartTime);
        appt.setEndTime(DateTimeUtil.parseTime(slot.getEndTime()));
        appt.setStatus(AppointmentStatus.CONFIRMED);

        appt = appointmentRepository.save(appt);

        auditLogService.log(principal.getId(), "RESCHEDULE_APPOINTMENT", "Appointment", appt.getId(),
                "Rescheduled appointment to " + newDate + " at " + request.getStartTime());

        return mapToDto(appt);
    }

    @Transactional
    public AppointmentDto updateStatus(UUID id, UpdateStatusRequest request, UserPrincipal principal) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        if (principal.getRole() == Role.DOCTOR && !appt.getDoctor().getId().equals(principal.getId())) {
            throw new ForbiddenException("Not authorized.");
        }

        appt.setStatus(request.getStatus());
        appt = appointmentRepository.save(appt);

        auditLogService.log(principal.getId(), "STATUS_" + request.getStatus().name(), "Appointment", appt.getId(),
                "Updated status to " + request.getStatus().name());

        return mapToDto(appt);
    }

    @Transactional(readOnly = true)
    public List<ConsultationNoteDto> getNotes(UUID appointmentId, UserPrincipal principal) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        boolean isPatient = principal.getRole() == Role.PATIENT && appt.getPatient().getId().equals(principal.getId());
        boolean isDoctor = principal.getRole() == Role.DOCTOR && appt.getDoctor().getId().equals(principal.getId());
        boolean isStaff = principal.getRole() == Role.ADMIN || principal.getRole() == Role.RECEPTIONIST;

        if (!isPatient && !isDoctor && !isStaff) {
            throw new ForbiddenException("Not authorized to view consultation notes.");
        }

        return consultationNoteRepository.findByAppointmentId(appointmentId).stream()
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
    }

    @Transactional
    public ConsultationNoteDto addNote(UUID appointmentId, ConsultationNoteRequest request, UserPrincipal principal) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        if (!appt.getDoctor().getId().equals(principal.getId())) {
            throw new ForbiddenException("Not authorized.");
        }

        ConsultationNote note = ConsultationNote.builder()
                .appointment(appt)
                .doctor(appt.getDoctor())
                .patient(appt.getPatient())
                .diagnosis(request.getDiagnosis().trim())
                .notes(request.getNotes().trim())
                .build();

        note = consultationNoteRepository.save(note);

        auditLogService.log(principal.getId(), "ADD_NOTE", "Appointment", appt.getId(), "Consultation note added by doctor");

        return ConsultationNoteDto.builder()
                .id(note.getId())
                .appointmentId(note.getAppointment().getId())
                .doctorId(note.getDoctor().getId())
                .patientId(note.getPatient().getId())
                .diagnosis(note.getDiagnosis())
                .notes(note.getNotes())
                .createdAt(note.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<PrescriptionDto> getPrescriptions(UUID appointmentId, UserPrincipal principal) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        boolean isPatient = principal.getRole() == Role.PATIENT && appt.getPatient().getId().equals(principal.getId());
        boolean isDoctor = principal.getRole() == Role.DOCTOR && appt.getDoctor().getId().equals(principal.getId());
        boolean isStaff = principal.getRole() == Role.ADMIN || principal.getRole() == Role.RECEPTIONIST;

        if (!isPatient && !isDoctor && !isStaff) {
            throw new ForbiddenException("Not authorized to view prescriptions.");
        }

        return prescriptionRepository.findByAppointmentIdWithItems(appointmentId).stream()
                .map(this::mapPrescriptionToDto)
                .toList();
    }

    @Transactional
    public PrescriptionDto addPrescription(UUID appointmentId, PrescriptionRequest request, UserPrincipal principal) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        if (!appt.getDoctor().getId().equals(principal.getId())) {
            throw new ForbiddenException("Not authorized.");
        }

        Prescription prescription = Prescription.builder()
                .appointment(appt)
                .doctor(appt.getDoctor())
                .patient(appt.getPatient())
                .build();

        List<PrescriptionItem> items = request.getItems().stream()
                .map(itemDto -> PrescriptionItem.builder()
                        .prescription(prescription)
                        .medicine(itemDto.getMedicine().trim())
                        .dosage(itemDto.getDosage().trim())
                        .frequency(itemDto.getFrequency().trim())
                        .durationDays(itemDto.getDurationDays())
                        .instructions(itemDto.getInstructions())
                        .build())
                .toList();

        prescription.setItems(items);
        Prescription savedPrescription = prescriptionRepository.save(prescription);

        auditLogService.log(principal.getId(), "ADD_PRESCRIPTION", "Appointment", appt.getId(), "Prescription issued by doctor");

        return mapPrescriptionToDto(savedPrescription);
    }

    public AppointmentDto mapToDto(Appointment a) {
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

    @Transactional(readOnly = true)
    public List<PatientVitalsDto> getVitals(UUID appointmentId, UserPrincipal principal) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        boolean isPatient = principal.getRole() == Role.PATIENT && appt.getPatient().getId().equals(principal.getId());
        boolean isDoctor = principal.getRole() == Role.DOCTOR && appt.getDoctor().getId().equals(principal.getId());
        boolean isStaff = principal.getRole() == Role.ADMIN || principal.getRole() == Role.RECEPTIONIST;

        if (!isPatient && !isDoctor && !isStaff) {
            throw new ForbiddenException("Not authorized to view vitals.");
        }

        return patientVitalsRepository.findByAppointmentIdOrderByRecordedAtDesc(appointmentId).stream()
                .map(this::mapVitalsToDto)
                .toList();
    }

    @Transactional
    public PatientVitalsDto recordVitals(UUID appointmentId, RecordVitalsRequest request, UserPrincipal principal) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        User recordedBy = userRepository.findById(principal.getId()).orElse(null);

        PatientVitals vitals = PatientVitals.builder()
                .appointment(appt)
                .patient(appt.getPatient())
                .recordedBy(recordedBy)
                .bloodPressure(request.getBloodPressure() != null ? request.getBloodPressure().trim() : null)
                .heartRate(request.getHeartRate())
                .temperature(request.getTemperature())
                .spo2(request.getSpo2())
                .weightKg(request.getWeightKg())
                .build();

        vitals = patientVitalsRepository.save(vitals);

        auditLogService.log(principal.getId(), "RECORD_VITALS", "PatientVitals", vitals.getId(),
                "Recorded clinical vitals for " + appt.getPatient().getFullName() + " (BP: " + vitals.getBloodPressure() + ")");

        return mapVitalsToDto(vitals);
    }

    private PatientVitalsDto mapVitalsToDto(PatientVitals v) {
        return PatientVitalsDto.builder()
                .id(v.getId())
                .appointmentId(v.getAppointment().getId())
                .patientId(v.getPatient().getId())
                .recordedByName(v.getRecordedBy() != null ? v.getRecordedBy().getFullName() : "Clinical Staff")
                .bloodPressure(v.getBloodPressure())
                .heartRate(v.getHeartRate())
                .temperature(v.getTemperature())
                .spo2(v.getSpo2())
                .weightKg(v.getWeightKg())
                .recordedAt(v.getRecordedAt())
                .build();
    }
}
