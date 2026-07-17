package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Login using Email
    Optional<User> findByEmail(String email);

    // Login using University ID
    Optional<User> findByUniversityId(String universityId);

    // Login using either Email OR University ID
    Optional<User> findByEmailOrUniversityId(String email, String universityId);

    // Get all users by role
    List<User> findByRole(Role role);
}