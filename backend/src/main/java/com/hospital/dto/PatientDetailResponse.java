package com.hospital.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hospital.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientDetailResponse {

    private PatientRecordDto patient;
    private List<AppointmentDto> appointments;
    private List<ConsultationNoteDto> notes;
    private List<PrescriptionDto> prescriptions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PatientRecordDto {
        private UUID id;
        private String fullName;
        private String email;
        private String phone;
        private Gender gender;
        private LocalDate dateOfBirth;
        private String patientCode;
        private String address;
        private String bloodGroup;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String allergies;
        private String chronicConditions;
        private String insuranceProvider;
        private String insurancePolicyNo;
    }
}
