package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(Principal principal) {
        List<User> users = userRepository.findAll();

        if (principal != null) {
            User currentUser = userRepository.findByEmail(principal.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == Role.INSTITUTION_ADMIN) {
                String inst = currentUser.getInstitution();
                users = users.stream()
                        .filter(u -> u.getRole() == Role.SYSTEM_ADMIN || inst == null || inst.trim().isEmpty() || inst.equalsIgnoreCase(u.getInstitution()) || u.getInstitution() == null)
                        .collect(Collectors.toList());
            }
        }

        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id).map(user -> {
            if (request.containsKey("role")) {
                try {
                    user.setRole(Role.valueOf(request.get("role")));
                    userRepository.save(user);
                    return ResponseEntity.ok(user);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Invalid role value");
                }
            }
            return ResponseEntity.badRequest().body("Role is required");
        }).orElse(ResponseEntity.notFound().build());
    }
}
