package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationBillDto {
    private UUID id;
    private String billNumber;
    private UUID appointmentId;
    private Integer tokenNumber;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private UUID patientId;
    private String patientName;
    private String patientPhone;
    private String patientCode;
    private String doctorName;
    private String departmentName;
    private BigDecimal consultationFee;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private String paymentMethod;
    private String transactionReference;
    private String cashierName;
    private Instant paidAt;
    private Instant createdAt;
}
