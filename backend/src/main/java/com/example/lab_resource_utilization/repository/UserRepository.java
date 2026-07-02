package com.example.lab_resource_utilization.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.lab_resource_utilization.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

}