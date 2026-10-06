package com.hospital.config;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized, skipping seed.");
            return;
        }

        log.info("Initializing database with demo healthcare data...");

        String defaultHash = passwordEncoder.encode("Password@123");

        // 1. Departments
        Department generalMedicine = departmentRepository.save(Department.builder()
                .name("General Medicine")
                .description("Primary care and general consultations")
                .isActive(true)
                .build());

        Department cardiology = departmentRepository.save(Department.builder()
                .name("Cardiology")
                .description("Heart and cardiovascular care")
                .isActive(true)
                .build());

        Department pediatrics = departmentRepository.save(Department.builder()
                .name("Pediatrics")
                .description("Child healthcare")
                .isActive(true)
                .build());

        Department orthopedics = departmentRepository.save(Department.builder()
                .name("Orthopedics")
                .description("Bone, joint, and muscle care")
                .isActive(true)
                .build());

        Department gynecology = departmentRepository.save(Department.builder()
                .name("Gynecology")
                .description("Women's health")
                .isActive(true)
                .build());

        Department ent = departmentRepository.save(Department.builder()
                .name("ENT")
                .description("Ear, nose, and throat care")
                .isActive(true)
                .build());

        Department[] depts = {generalMedicine, cardiology, pediatrics, orthopedics, gynecology, ent};

        // 2. Admin User
        userRepository.save(User.builder()
                .role(Role.ADMIN)
                .email("admin@medicarehospital.in")
                .passwordHash(defaultHash)
                .fullName("Hospital Administrator")
                .phone("9847000001")
                .isActive(true)
                .build());

        // 3. Receptionist User
        userRepository.save(User.builder()
                .role(Role.RECEPTIONIST)
                .email("reception@medicarehospital.in")
                .passwordHash(defaultHash)
                .fullName("Anjali Menon")
                .phone("9847000002")
                .isActive(true)
                .build());

        // 4. Doctors
        record DoctorSeed(String name, int deptIdx, String spec, int fee, int exp) {}
        DoctorSeed[] doctorSeeds = {
                new DoctorSeed("Dr. Suresh Nair", 0, "General Physician", 300, 14),
                new DoctorSeed("Dr. Priya Varma", 1, "Cardiologist", 700, 11),
                new DoctorSeed("Dr. Arun Thomas", 2, "Pediatrician", 400, 9),
                new DoctorSeed("Dr. Meera Pillai", 3, "Orthopedic Surgeon", 600, 16),
                new DoctorSeed("Dr. Lakshmi Kutty", 4, "Gynecologist", 500, 13),
                new DoctorSeed("Dr. Ravi Menon", 5, "ENT Surgeon", 450, 8)
        };

        for (int i = 0; i < doctorSeeds.length; i++) {
            DoctorSeed seed = doctorSeeds[i];
            User docUser = userRepository.save(User.builder()
                    .role(Role.DOCTOR)
                    .email(String.format("doctor%d@medicarehospital.in", i + 1))
                    .passwordHash(defaultHash)
                    .fullName(seed.name)
                    .phone(String.format("98470000%02d", 10 + i))
                    .isActive(true)
                    .build());

            DoctorProfile profile = doctorProfileRepository.save(DoctorProfile.builder()
                    .user(docUser)
                    .department(depts[seed.deptIdx])
                    .specialization(seed.spec)
                    .qualification("MBBS, MD")
                    .registrationNo(String.format("KMC-%d", 10000 + i))
                    .consultationFee(BigDecimal.valueOf(seed.fee))
                    .yearsExperience(seed.exp)
                    .bio(String.format("%s with %d years of experience at Medicare Hospital, Irinjalakuda.", seed.spec, seed.exp))
                    .build());

            List<DoctorAvailability> avail = new ArrayList<>();
            avail.add(createAvail(profile, DoctorDay.MON, "09:00", "13:00"));
            avail.add(createAvail(profile, DoctorDay.TUE, "09:00", "13:00"));
            avail.add(createAvail(profile, DoctorDay.WED, "09:00", "13:00"));
            avail.add(createAvail(profile, DoctorDay.THU, "16:00", "19:00"));
            avail.add(createAvail(profile, DoctorDay.FRI, "09:00", "13:00"));
            avail.add(createAvail(profile, DoctorDay.SAT, "09:00", "12:00"));
            doctorAvailabilityRepository.saveAll(avail);
        }

        // 5. Demo Patient
        User patientUser = userRepository.save(User.builder()
                .role(Role.PATIENT)
                .email("patient@example.com")
                .passwordHash(defaultHash)
                .fullName("Rahul Krishnan")
                .phone("9037000099")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(1990, 5, 12))
                .isActive(true)
                .build());

        patientProfileRepository.save(PatientProfile.builder()
                .user(patientUser)
                .patientCode("MCH-2026-000001")
                .address("Irinjalakuda, Thrissur, Kerala")
                .bloodGroup("O+")
                .emergencyContactName("Suja Krishnan")
                .emergencyContactPhone("9037000098")
                .build());

        log.info("Demo data seeding completed successfully.");
    }

    private DoctorAvailability createAvail(DoctorProfile profile, DoctorDay day, String start, String end) {
        return DoctorAvailability.builder()
                .doctorProfile(profile)
                .day(day)
                .startTime(LocalTime.parse(start))
                .endTime(LocalTime.parse(end))
                .slotMinutes(15)
                .build();
    }
}
