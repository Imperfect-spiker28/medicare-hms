package com.hospital.controller;

import com.hospital.dto.CurrentUserResponse;
import com.hospital.dto.LoginRequest;
import com.hospital.dto.LoginResponse;
import com.hospital.dto.RegisterRequest;
import com.hospital.security.JwtAuthenticationFilter;
import com.hospital.security.UserPrincipal;
import com.hospital.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        LoginResponse loginResponse = authService.login(request);
        setSessionCookie(response, loginResponse.getToken(), Duration.ofDays(7));
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        LoginResponse registerResponse = authService.register(request);
        setSessionCookie(response, registerResponse.getToken(), Duration.ofDays(7));
        return ResponseEntity.ok(registerResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CurrentUserResponse response = authService.getCurrentUser(principal != null ? principal.getId() : null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Boolean>> logout(HttpServletResponse response) {
        setSessionCookie(response, "", Duration.ZERO);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private void setSessionCookie(HttpServletResponse response, String token, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(JwtAuthenticationFilter.SESSION_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // Set to true behind HTTPS in production
                .path("/")
                .sameSite("Lax")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
