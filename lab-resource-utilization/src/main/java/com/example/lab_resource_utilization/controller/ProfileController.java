package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.ProfileResponse;
import com.example.lab_resource_utilization.dto.UpdateProfileRequest;
import com.example.lab_resource_utilization.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    // Get Logged-in User Profile
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getProfile(Principal principal) {

        ProfileResponse response =
                profileService.getProfile(principal.getName());

        return ResponseEntity.ok(response);
    }

    // Update Logged-in User Profile
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Principal principal) {

        ProfileResponse response =
                profileService.updateProfile(
                        principal.getName(),
                        request
                );

        return ResponseEntity.ok(response);
    }

}