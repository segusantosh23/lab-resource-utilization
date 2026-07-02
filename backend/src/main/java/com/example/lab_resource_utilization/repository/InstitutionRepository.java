package com.example.lab_resource_utilization.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.lab_resource_utilization.entity.Institution;

public interface InstitutionRepository extends JpaRepository<Institution, String> {

}