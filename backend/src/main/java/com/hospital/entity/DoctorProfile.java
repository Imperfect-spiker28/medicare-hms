package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "doctor_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private String qualification;

    @Column(name = "registration_no", nullable = false)
    private String registrationNo;

    @Column(name = "consultation_fee", nullable = false)
    @Builder.Default
    private BigDecimal consultationFee = BigDecimal.ZERO;

    @Column(name = "years_experience", nullable = false)
    @Builder.Default
    private Integer yearsExperience = 0;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @OneToMany(mappedBy = "doctorProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DoctorAvailability> availability = new ArrayList<>();

    @OneToMany(mappedBy = "doctorProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DoctorLeave> leaves = new ArrayList<>();
}
