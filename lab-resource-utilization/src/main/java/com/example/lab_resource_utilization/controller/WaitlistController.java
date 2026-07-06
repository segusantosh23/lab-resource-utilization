package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.WaitlistRequest;
import com.example.lab_resource_utilization.dto.WaitlistResponse;
import com.example.lab_resource_utilization.service.WaitlistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/waitlist")
public class WaitlistController {

    @Autowired
    private WaitlistService waitlistService;

    /**
     * GET /waitlist/my  — current user's waitlist entries
     */
    @GetMapping("/my")
    public ResponseEntity<List<WaitlistResponse>> getMyWaitlist(Principal principal) {
        return ResponseEntity.ok(waitlistService.getMyWaitlist(principal.getName()));
    }

    /**
     * GET /waitlist  — all entries (managers/admins only)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<List<WaitlistResponse>> getAllWaitlist() {
        return ResponseEntity.ok(waitlistService.getAllWaitlist());
    }

    /**
     * POST /waitlist  — join the waitlist for a piece of equipment
     * Body: { "equipmentId": 5 }
     */
    @PostMapping
    public ResponseEntity<WaitlistResponse> joinWaitlist(
            @Valid @RequestBody WaitlistRequest request,
            Principal principal) {
        WaitlistResponse response = waitlistService.joinWaitlist(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /waitlist/{id}  — leave / remove a waitlist entry
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> leaveWaitlist(
            @PathVariable Long id,
            Principal principal) {

        // Check if caller is an admin/manager so service can skip ownership check
        boolean isAdmin = false;
        try {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder
                            .getContext().getAuthentication();
            isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().matches(
                            "ROLE_LAB_MANAGER|ROLE_INSTITUTION_ADMIN|ROLE_SYSTEM_ADMIN"));
        } catch (Exception ignored) {}

        waitlistService.leaveWaitlist(id, principal.getName(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
