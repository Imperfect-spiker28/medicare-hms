package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "patient_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "patient_code", nullable = false, unique = true, length = 50)
    private String patientCode;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "blood_group", length = 20)
    private String bloodGroup;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 50)
    private String emergencyContactPhone;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "chronic_conditions", columnDefinition = "TEXT")
    private String chronicConditions;

    @Column(name = "insurance_provider")
    private String insuranceProvider;

    @Column(name = "insurance_policy_no")
    private String insurancePolicyNo;
}
