package com.example.lab_resource_utilization.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // GET ALL
    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Optional<User> getUser(@PathVariable String id) {
        return service.getUserById(id);
    }

    // POST
    @PostMapping
    public User addUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    // PUT
    @PutMapping("/{id}")
    public User updateUser(@PathVariable String id,
                           @RequestBody User user) {
        return service.updateUser(id, user);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable String id) {
        service.deleteUser(id);
        return "User deleted successfully";
    }
}