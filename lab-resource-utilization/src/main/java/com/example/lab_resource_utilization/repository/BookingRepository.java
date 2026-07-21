package com.example.lab_resource_utilization.repository;
import java.util.List;
import com.example.lab_resource_utilization.entity.Booking;
import com.example.lab_resource_utilization.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);
List<Booking> findByEquipmentDepartmentAndEquipmentInstitution(
        String department,
        String institution
);

List<Booking> findByEquipmentInstitution(String institution);
    List<Booking> findByUserEmailOrderByCreatedAtDesc(String email);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByEquipmentId(Long equipmentId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT b FROM Booking b WHERE b.equipment.id = :equipmentId " +
           "AND b.status IN :activeStatuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @Param("equipmentId") Long equipmentId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("activeStatuses") List<BookingStatus> activeStatuses);

    @Query("SELECT b FROM Booking b WHERE b.equipment.id = :equipmentId " +
           "AND b.id != :bookingId " +
           "AND b.status IN :activeStatuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookingsExcludingId(
            @Param("equipmentId") Long equipmentId,
            @Param("bookingId") Long bookingId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("activeStatuses") List<BookingStatus> activeStatuses);
    long countByStatus(BookingStatus status);

    @Query("SELECT COUNT(DISTINCT b.equipment.id) FROM Booking b WHERE b.status IN :statuses")
    long countDistinctEquipmentByStatuses(@Param("statuses") List<BookingStatus> statuses);

    /**
     * Sum of quantity for all active bookings (CONFIRMED or IN_USE) for a given
     * equipment that overlap with the given point in time.
     */
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM Booking b "
         + "WHERE b.equipment.id = :equipmentId "
         + "AND b.status IN ('CONFIRMED', 'IN_USE') "
         + "AND b.startTime <= :now AND b.endTime > :now")
    Integer sumActiveQuantityNow(@Param("equipmentId") Long equipmentId,
                                 @Param("now") LocalDateTime now);

    /**
     * Sum of quantity for ALL active bookings (PENDING, CONFIRMED, IN_USE) for
     * a given equipment that have not yet ended — used for overall capacity check.
     */
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM Booking b "
         + "WHERE b.equipment.id = :equipmentId "
         + "AND b.status IN ('PENDING_APPROVAL','CONFIRMED', 'IN_USE') "
         + "AND b.endTime > :now")
    Integer sumFutureActiveQuantity(@Param("equipmentId") Long equipmentId,
                                    @Param("now") LocalDateTime now);

    /**
     * Find bookings that are still IN_USE but their end time has passed, 
     * and a notification has not been sent yet.
     */
    @Query("SELECT b FROM Booking b WHERE b.status = 'IN_USE' AND b.endTime < :now AND b.overdueNotified = false")
    List<Booking> findOverdueBookingsNotNotified(@Param("now") LocalDateTime now);
}

