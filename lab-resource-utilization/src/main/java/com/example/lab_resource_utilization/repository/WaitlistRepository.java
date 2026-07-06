package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.Waitlist;
import com.example.lab_resource_utilization.entity.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    // All entries for a specific user
    List<Waitlist> findByUserEmailOrderByJoinedAtAsc(String email);

    // All entries for a specific equipment (ordered by position)
    List<Waitlist> findByEquipmentIdOrderByPositionAsc(Long equipmentId);

    // All waitlist entries (for admin/manager view)
    List<Waitlist> findAllByOrderByEquipmentIdAscPositionAsc();

    // Check if user is already on the waitlist for this equipment
    Optional<Waitlist> findByUserEmailAndEquipmentId(String email, Long equipmentId);

    // Count waiters for a specific equipment (for position calculation)
    @Query("SELECT COUNT(w) FROM Waitlist w WHERE w.equipment.id = :equipmentId AND w.status = 'WAITING'")
    int countWaitingByEquipmentId(@Param("equipmentId") Long equipmentId);

    // Get all WAITING entries for an equipment ordered by position (for rebalancing)
    @Query("SELECT w FROM Waitlist w WHERE w.equipment.id = :equipmentId AND w.status = 'WAITING' ORDER BY w.position ASC")
    List<Waitlist> findWaitingByEquipmentIdOrdered(@Param("equipmentId") Long equipmentId);
}
