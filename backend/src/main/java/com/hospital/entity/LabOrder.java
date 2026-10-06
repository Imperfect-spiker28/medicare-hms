package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lab_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", nullable = false, unique = true, length = 64)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordering_doctor_id", nullable = false)
    private User orderingDoctor;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Column(name = "test_category", nullable = false, length = 100)
    private String testCategory;

    @Column(name = "sample_type", length = 50)
    private String sampleType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private LabOrderStatus status = LabOrderStatus.REQUESTED;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "result_value", columnDefinition = "TEXT")
    private String resultValue;

    @Column(name = "reference_range", columnDefinition = "TEXT")
    private String referenceRange;

    @Column(name = "interpretation", length = 100)
    private String interpretation; // e.g. NORMAL, ELEVATED, LOW, ABNORMAL

    @Column(name = "technician_remarks", columnDefinition = "TEXT")
    private String technicianRemarks;

    @Column(name = "completed_at")
    private Instant completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
