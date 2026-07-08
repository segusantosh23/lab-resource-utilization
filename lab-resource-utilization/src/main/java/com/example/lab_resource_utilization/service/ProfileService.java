package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.ProfileResponse;
import com.example.lab_resource_utilization.dto.UpdateProfileRequest;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.exception.ResourceNotFoundException;
import com.example.lab_resource_utilization.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    // Get Logged-in User Profile
    public ProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return mapToResponse(user);

    }

    // Update Logged-in User Profile
    public ProfileResponse updateProfile(String email,
                                         UpdateProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        user.setName(request.getName());
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setInstitution(request.getInstitution());

        User updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);

    }

    // Convert Entity → DTO
    private ProfileResponse mapToResponse(User user) {

        ProfileResponse response = new ProfileResponse();

        response.setId(user.getId());
        response.setName(user.getName());

        // Read Only
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        response.setAge(user.getAge());
        response.setGender(user.getGender());
        response.setPhone(user.getPhone());
        response.setDepartment(user.getDepartment());
        response.setInstitution(user.getInstitution());

        return response;

    }

}