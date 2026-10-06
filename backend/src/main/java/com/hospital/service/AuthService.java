package com.hospital.service;

import com.hospital.dto.CurrentUserResponse;
import com.hospital.dto.LoginRequest;
import com.hospital.dto.LoginResponse;
import com.hospital.dto.RegisterRequest;
import com.hospital.dto.UserDto;
import com.hospital.entity.PatientProfile;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.ConflictException;
import com.hospital.exception.UnauthorizedException;
import com.hospital.repository.PatientProfileRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getRole(), user.getFullName());

        auditLogService.log(user.getId(), "LOGIN", "User", user.getId(), "User logged in successfully");

        return LoginResponse.builder()
                .token(token)
                .user(mapToDto(user))
                .build();
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists.");
        }

        User user = User.builder()
                .role(Role.PATIENT)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        long count = patientProfileRepository.count() + 1;
        String patientCode = String.format("MCH-%d-%06d", Year.now().getValue(), count);

        PatientProfile profile = PatientProfile.builder()
                .user(user)
                .patientCode(patientCode)
                .build();

        patientProfileRepository.save(profile);

        String token = tokenProvider.generateToken(user.getId(), user.getRole(), user.getFullName());

        auditLogService.log(user.getId(), "REGISTER", "User", user.getId(), "Patient self-registered with health card " + patientCode);

        return LoginResponse.builder()
                .token(token)
                .user(mapToDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(UUID userId) {
        if (userId == null) {
            return new CurrentUserResponse(null);
        }

        return userRepository.findById(userId)
                .map(user -> new CurrentUserResponse(mapToDto(user)))
                .orElse(new CurrentUserResponse(null));
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .role(user.getRole())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .isActive(user.getIsActive())
                .build();
    }
}
