package com.example.lab_resource_utilization.entity;

/**
 * Defines all permitted roles in the Lab Resource Utilization Platform.
 *
 * RESEARCHER         - Can view equipment and manage their own bookings.
 * LAB_TECHNICIAN     - Can view equipment, update equipment status, and manage maintenance.
 * LAB_MANAGER        - Full equipment CRUD, manage all bookings, view utilization reports.
 * DEPARTMENT_HEAD    - Can view department reports and analytics.
 * INSTITUTION_ADMIN  - Can manage departments, users, and institution-level resources.
 * SYSTEM_ADMIN       - Full access to all modules and resources.
 */
public enum Role {
    RESEARCHER,
    LAB_TECHNICIAN,
    LAB_MANAGER,
    DEPARTMENT_HEAD,
    INSTITUTION_ADMIN,
    SYSTEM_ADMIN
}
