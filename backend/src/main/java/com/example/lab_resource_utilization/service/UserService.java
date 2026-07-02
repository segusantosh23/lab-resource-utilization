package com.example.lab_resource_utilization.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    // GET ALL
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    // GET BY ID
    public Optional<User> getUserById(String id) {
        return repository.findById(id);
    }

    // POST
    public User saveUser(User user) {
        return repository.save(user);
    }

    // PUT
    public User updateUser(String id, User user) {

        Optional<User> existing = repository.findById(id);

        if (existing.isPresent()) {

            User updated = existing.get();

            updated.setName(user.getName());
            updated.setEmail(user.getEmail());
            updated.setPassword(user.getPassword());
            updated.setRole(user.getRole());
            updated.setInstitutionId(user.getInstitutionId());

            return repository.save(updated);
        }

        return null;
    }

    // DELETE
    public void deleteUser(String id) {
        repository.deleteById(id);
    }
}