package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.LoginRequest;
import com.example.lab_resource_utilization.dto.LoginResponse;
import com.example.lab_resource_utilization.dto.RegisterRequest;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.UserRepository;
import com.example.lab_resource_utilization.util.JwtUtil;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil; // ✅ IMPORTANT FIX

    // ===============================
    // ✅ TEST: REGISTER SUCCESS
    // ===============================
    @Test
    void testRegister_Success() {

        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("1234");
        request.setName("Yamini");
        request.setRole("RESEARCHER");

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("1234"))
                .thenReturn("encodedPassword");

        String result = authService.register(request);

        assertEquals("User registered successfully", result);
        verify(userRepository).save(any(User.class));
    }

    // ===============================
    // ❌ TEST: REGISTER EMAIL EXISTS
    // ===============================
    @Test
    void testRegister_EmailAlreadyExists() {

        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(new User()));

        String result = authService.register(request);

        assertEquals("Email already registered", result);
        verify(userRepository, never()).save(any());
    }

    // ===============================
    // ✅ TEST: REGISTER ALL ROLES
    // ===============================
    @Test
    void testRegister_AllRoles() {

        for (Role role : Role.values()) {

            RegisterRequest request = new RegisterRequest();
            request.setEmail(role.name() + "@test.com");
            request.setPassword("1234");
            request.setName("User-" + role.name());
            request.setRole(role.name());

            when(userRepository.findByEmail(request.getEmail()))
                    .thenReturn(Optional.empty());

            when(passwordEncoder.encode("1234"))
                    .thenReturn("encodedPassword");

            String result = authService.register(request);

            assertEquals("User registered successfully", result);
        }

        verify(userRepository, atLeastOnce()).save(any(User.class));
    }

    // ===============================
    // ✅ TEST: LOGIN SUCCESS
    // ===============================
    @Test
    void testLogin_Success() {

        LoginRequest request = new LoginRequest();
        request.setLogin("test@gmail.com");
        request.setPassword("1234");

        User user = new User();
        user.setEmail("test@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(Role.RESEARCHER);
        user.setEmailVerified(true);

        when(userRepository.findByEmailOrUniversityId(any(), any()))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("1234", "encodedPassword"))
                .thenReturn(true);

        // ✅ FIX: mock JWT
        when(jwtUtil.generateToken(anyString(), anyString()))
                .thenReturn("mock-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("Login successful", response.getMessage());

        verify(userRepository).save(user);
    }

    // ===============================
    // ❌ TEST: LOGIN USER NOT FOUND
    // ===============================
    @Test
    void testLogin_UserNotFound() {

        LoginRequest request = new LoginRequest();
        request.setLogin("test@gmail.com");
        request.setPassword("1234");

        when(userRepository.findByEmailOrUniversityId(any(), any()))
                .thenReturn(Optional.empty());

        LoginResponse response = authService.login(request);

        assertEquals("User not found", response.getMessage());
    }

    // ===============================
    // ❌ TEST: LOGIN EMAIL NOT VERIFIED
    // ===============================
    @Test
    void testLogin_EmailNotVerified() {

        LoginRequest request = new LoginRequest();
        request.setLogin("test@gmail.com");
        request.setPassword("1234");

        User user = new User();
        user.setEmail("test@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(Role.RESEARCHER);
        user.setEmailVerified(false);

        when(userRepository.findByEmailOrUniversityId(any(), any()))
                .thenReturn(Optional.of(user));

        LoginResponse response = authService.login(request);

        assertEquals("Email not verified. Please complete signup verification.", response.getMessage());
    }

    // ===============================
    // ❌ TEST: LOGIN WRONG PASSWORD
    // ===============================
    @Test
    void testLogin_WrongPassword() {

        LoginRequest request = new LoginRequest();
        request.setLogin("test@gmail.com");
        request.setPassword("wrong");

        User user = new User();
        user.setEmail("test@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(Role.RESEARCHER);
        user.setEmailVerified(true);

        when(userRepository.findByEmailOrUniversityId(any(), any()))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("wrong", "encodedPassword"))
                .thenReturn(false);

        LoginResponse response = authService.login(request);

        assertEquals("Invalid password", response.getMessage());
    }
}