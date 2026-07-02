package com.example.lab_resource_utilization.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "institution")
public class Institution {

    @Id
    private String institutionId;

    private String name;

    private String address;

    private String email;

    private String phone;

    public Institution() {
    }

    public Institution(String institutionId, String name, String address, String email, String phone) {
        this.institutionId = institutionId;
        this.name = name;
        this.address = address;
        this.email = email;
        this.phone = phone;
    }

    public String getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}