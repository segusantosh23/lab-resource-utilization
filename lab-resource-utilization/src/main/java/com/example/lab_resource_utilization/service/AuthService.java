package com.example.lab_resource_utilization.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.lab_resource_utilization.dto.LoginRequest;
import com.example.lab_resource_utilization.dto.RegisterRequest;
import com.example.lab_resource_utilization.dto.LoginResponse;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.UserRepository;
import com.example.lab_resource_utilization.util.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public String register(RegisterRequest request) {

        // Check whether the email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already registered";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Encrypt the password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Parse the role string to the Role enum (e.g. "LAB_MANAGER" → Role.LAB_MANAGER)
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));

        userRepository.save(user);

        return "User registered successfully";
    }

    public LoginResponse login(LoginRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new LoginResponse("User not found");
        }

        User user = userOpt.get();

        // Compare entered password with encrypted password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse("Invalid password");
        }

        // Generate JWT token — call .name() to convert the Role enum to a plain string
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(token, user.getEmail(), user.getName(), user.getRole().name(), "Login successful");
    }
}