package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "doctor_leave", uniqueConstraints = {
        @UniqueConstraint(name = "uq_doctor_leave", columnNames = {"doctor_id", "leave_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorLeave {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnore
    private DoctorProfile doctorProfile;

    @Column(name = "leave_date", nullable = false)
    private LocalDate leaveDate;
}
