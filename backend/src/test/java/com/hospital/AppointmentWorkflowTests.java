package com.hospital;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.CreateAppointmentRequest;
import com.hospital.dto.PatchAppointmentRequest;
import com.hospital.dto.UpdateStatusRequest;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.AppointmentType;
import com.hospital.entity.DoctorProfile;
import com.hospital.entity.User;
import com.hospital.repository.DoctorProfileRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AppointmentWorkflowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User patientUser;
    private DoctorProfile doctorProfile;
    private String patientToken;
    private String doctorToken;

    @BeforeEach
    void setUp() {
        patientUser = userRepository.findByEmailIgnoreCase("patient@example.com").orElseThrow();
        doctorProfile = doctorProfileRepository.findAllActiveWithDetails().getFirst();

        patientToken = tokenProvider.generateToken(patientUser.getId(), patientUser.getRole(), patientUser.getFullName());
        doctorToken = tokenProvider.generateToken(doctorProfile.getUser().getId(), doctorProfile.getUser().getRole(), doctorProfile.getUser().getFullName());
    }

    @Test
    void shouldBookAndManageAppointmentLifecycle() throws Exception {
        // Next Monday
        LocalDate nextMonday = LocalDate.now().plusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));

        CreateAppointmentRequest bookRequest = new CreateAppointmentRequest(
                doctorProfile.getUserId(),
                null,
                nextMonday,
                "09:00",
                AppointmentType.ONLINE,
                "Routine checkup"
        );

        // 1. Patient Books Appointment
        String responseContent = mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointment.id").isNotEmpty())
                .andExpect(jsonPath("$.appointment.tokenNumber").value(1))
                .andExpect(jsonPath("$.appointment.status").value("CONFIRMED"))
                .andReturn().getResponse().getContentAsString();

        String appointmentId = objectMapper.readTree(responseContent).path("appointment").path("id").asText();

        // 2. Double booking the same slot must fail with 409 Conflict
        mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").isNotEmpty());

        // 3. Doctor checks in patient
        UpdateStatusRequest statusRequest = new UpdateStatusRequest(AppointmentStatus.CHECKED_IN);
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/status")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointment.status").value("CHECKED_IN"));

        // 4. Doctor completes consultation
        statusRequest = new UpdateStatusRequest(AppointmentStatus.COMPLETED);
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/status")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointment.status").value("COMPLETED"));
    }

    @Test
    void shouldCancelAppointmentSuccessfully() throws Exception {
        LocalDate nextTuesday = LocalDate.now().plusWeeks(2).with(TemporalAdjusters.nextOrSame(DayOfWeek.TUESDAY));

        CreateAppointmentRequest bookRequest = new CreateAppointmentRequest(
                doctorProfile.getUserId(),
                null,
                nextTuesday,
                "09:15",
                AppointmentType.ONLINE,
                "Headache consultation"
        );

        String responseContent = mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String appointmentId = objectMapper.readTree(responseContent).path("appointment").path("id").asText();

        // Cancel
        PatchAppointmentRequest cancelReq = new PatchAppointmentRequest("CANCEL", "Cannot make it", null, null);
        mockMvc.perform(patch("/api/appointments/" + appointmentId)
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointment.status").value("CANCELLED"))
                .andExpect(jsonPath("$.appointment.cancelReason").value("Cannot make it"));
    }
}
