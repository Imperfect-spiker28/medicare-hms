package com.hospital;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.LoginRequest;
import com.hospital.dto.RegisterRequest;
import com.hospital.entity.Gender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldLoginSuccessfullyWithDemoAdminCredentials() throws Exception {
        LoginRequest request = new LoginRequest("admin@medicarehospital.in", "Password@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("mch_session"))
                .andExpect(jsonPath("$.user.email").value("admin@medicarehospital.in"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void shouldFailLoginWithIncorrectPassword() throws Exception {
        LoginRequest request = new LoginRequest("admin@medicarehospital.in", "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password."));
    }

    @Test
    void shouldRegisterNewPatientSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Naveen Paul",
                "naveen.paul." + System.currentTimeMillis() + "@test.com",
                "9847111222",
                "Password@123",
                Gender.MALE,
                LocalDate.of(1995, 3, 20)
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("mch_session"))
                .andExpect(jsonPath("$.user.fullName").value("Naveen Paul"))
                .andExpect(jsonPath("$.user.role").value("PATIENT"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void shouldReturnNullForUnauthenticatedMeEndpoint() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user").doesNotExist());
    }
}
