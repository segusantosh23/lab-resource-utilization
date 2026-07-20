# Email Notification System - Testing Guide

## Overview
Complete SMTP Email Notification System for Lab Resource Utilization Platform

**Base URL:** `http://localhost:8081/api/email`

---

## Available Endpoints

### 1. Health Check
**GET** `/api/email/health`

**Response:**
```json
{
  "status": "UP",
  "service": "Email Notification System",
  "timestamp": "2024-07-17T19:30:00",
  "availableEndpoints": [...]
}
```

---

### 2. Test Email
**POST** `/api/email/test`

**Request Body:**
```json
{
  "toEmail": "test@example.com",
  "subject": "Test Email",
  "message": "This is a test email from Lab Resource Utilization Platform",
  "isHtml": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "recipient": "test@example.com",
  "subject": "Test Email",
  "timestamp": "2024-07-17T19:30:00"
}
```

---

### 3. Booking Approved Email
**POST** `/api/email/booking-approved`

**Request Body:**
```json
{
  "toEmail": "researcher@university.edu",
  "userName": "Dr. Sarah Johnson",
  "equipmentName": "High-Performance Liquid Chromatography (HPLC)",
  "equipmentId": 101,
  "bookingDate": "2024-07-20T09:00:00",
  "startTime": "2024-07-20T09:00:00",
  "endTime": "2024-07-20T12:00:00",
  "labName": "Analytical Chemistry Lab",
  "department": "Chemistry",
  "bookingStatus": "CONFIRMED",
  "purpose": "Protein Analysis Research"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking approved email sent successfully",
  "recipient": "researcher@university.edu",
  "equipmentName": "High-Performance Liquid Chromatography (HPLC)",
  "bookingDate": "2024-07-20T09:00:00",
  "timestamp": "2024-07-17T19:30:00"
}
```

---

### 4. Booking Rejected Email
**POST** `/api/email/booking-rejected`

**Request Body:**
```json
{
  "toEmail": "student@university.edu",
  "userName": "John Smith",
  "equipmentName": "Scanning Electron Microscope (SEM)",
  "bookingDate": "2024-07-22T14:00:00",
  "startTime": "2024-07-22T14:00:00",
  "endTime": "2024-07-22T17:00:00",
  "rejectionReason": "Equipment is already booked for a priority research project during the requested time slot. Please choose an alternative time.",
  "contactEmail": "lab-support@university.edu",
  "contactPhone": "+1 (555) 123-4567"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking rejected email sent successfully",
  "recipient": "student@university.edu",
  "equipmentName": "Scanning Electron Microscope (SEM)",
  "rejectionReason": "Equipment is already booked...",
  "timestamp": "2024-07-17T19:30:00"
}
```

---

### 5. Maintenance Reminder Email
**POST** `/api/email/maintenance-reminder`

**Request Body:**
```json
{
  "toEmail": "technician@university.edu",
  "equipmentName": "Centrifuge Model X500",
  "equipmentId": 205,
  "maintenanceDate": "2024-07-25T10:00:00",
  "assignedTechnician": "Michael Chen",
  "equipmentStatus": "UNDER_MAINTENANCE",
  "maintenanceType": "Routine Preventive Maintenance",
  "notes": "Check rotor alignment, lubricate bearings, test emergency stop function, and verify speed accuracy"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Maintenance reminder email sent successfully",
  "recipient": "technician@university.edu",
  "equipmentName": "Centrifuge Model X500",
  "maintenanceDate": "2024-07-25T10:00:00",
  "assignedTechnician": "Michael Chen",
  "timestamp": "2024-07-17T19:30:00"
}
```

---

### 6. Calibration Reminder Email
**POST** `/api/email/calibration-reminder`

**Request Body:**
```json
{
  "toEmail": "lab-manager@university.edu",
  "equipmentName": "pH Meter - Benchtop Model",
  "equipmentId": 310,
  "calibrationDueDate": "2024-07-30T00:00:00",
  "daysRemaining": 13,
  "reminderMessage": "This equipment requires calibration before it can be used for any experiments. Please schedule calibration with the certified technician.",
  "calibrationFrequency": "Monthly"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Calibration reminder email sent successfully",
  "recipient": "lab-manager@university.edu",
  "equipmentName": "pH Meter - Benchtop Model",
  "calibrationDueDate": "2024-07-30T00:00:00",
  "daysRemaining": 13,
  "timestamp": "2024-07-17T19:30:00"
}
```

---

### 7. Waitlist Promotion Email
**POST** `/api/email/waitlist-promotion`

**Request Body:**
```json
{
  "toEmail": "researcher2@university.edu",
  "userName": "Dr. Emily Rodriguez",
  "equipmentName": "Soldering Station Pro-2000",
  "equipmentId": 450,
  "bookingDate": "2024-07-18T13:00:00",
  "startTime": "2024-07-18T13:00:00",
  "endTime": "2024-07-18T15:00:00",
  "newBookingStatus": "CONFIRMED",
  "confirmationMessage": "Congratulations! A booking slot has opened up and you have been automatically promoted from the waitlist. Your booking is now confirmed.",
  "bookingId": 7823
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Waitlist promotion email sent successfully",
  "recipient": "researcher2@university.edu",
  "equipmentName": "Soldering Station Pro-2000",
  "bookingDate": "2024-07-18T13:00:00",
  "newBookingStatus": "CONFIRMED",
  "timestamp": "2024-07-17T19:30:00"
}
```

---

### 8. Custom Email
**POST** `/api/email/custom`

**Request Body:**
```json
{
  "toEmail": "admin@university.edu",
  "subject": "Monthly Lab Utilization Report",
  "message": "<h1>Lab Utilization Report - July 2024</h1><p>Total bookings: 450</p><p>Most used equipment: HPLC</p>",
  "isHtml": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Custom email sent successfully",
  "recipient": "admin@university.edu",
  "subject": "Monthly Lab Utilization Report",
  "isHtml": true,
  "timestamp": "2024-07-17T19:30:00"
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid email address format: invalid-email",
  "timestamp": "2024-07-17T19:30:00",
  "status": 400
}
```

### Email Send Failed (500)
```json
{
  "success": false,
  "error": "Email Send Failed",
  "message": "Email authentication failed. Please check SMTP credentials.",
  "timestamp": "2024-07-17T19:30:00",
  "status": 500
}
```

---

## Testing with cURL

### 1. Test Email
```bash
curl -X POST http://localhost:8081/api/email/test \
-H "Content-Type: application/json" \
-d '{
  "toEmail": "your-email@example.com",
  "subject": "Test Email",
  "message": "This is a test email",
  "isHtml": false
}'
```

### 2. Booking Approved Email
```bash
curl -X POST http://localhost:8081/api/email/booking-approved \
-H "Content-Type: application/json" \
-d '{
  "toEmail": "your-email@example.com",
  "userName": "Dr. Sarah Johnson",
  "equipmentName": "HPLC System",
  "equipmentId": 101,
  "bookingDate": "2024-07-20T09:00:00",
  "startTime": "2024-07-20T09:00:00",
  "endTime": "2024-07-20T12:00:00",
  "labName": "Chemistry Lab",
  "department": "Chemistry",
  "bookingStatus": "CONFIRMED",
  "purpose": "Protein Analysis"
}'
```

### 3. Waitlist Promotion Email
```bash
curl -X POST http://localhost:8081/api/email/waitlist-promotion \
-H "Content-Type: application/json" \
-d '{
  "toEmail": "your-email@example.com",
  "userName": "Dr. Emily Rodriguez",
  "equipmentName": "Soldering Station",
  "equipmentId": 450,
  "bookingDate": "2024-07-18T13:00:00",
  "startTime": "2024-07-18T13:00:00",
  "endTime": "2024-07-18T15:00:00",
  "newBookingStatus": "CONFIRMED",
  "confirmationMessage": "You have been promoted from waitlist!",
  "bookingId": 7823
}'
```

---

## Testing with Postman

### 1. Import Collection
Create a new Postman collection named "Lab Email Notifications"

### 2. Add Environment Variables
- `BASE_URL`: `http://localhost:8081`
- `TEST_EMAIL`: `your-test-email@example.com`

### 3. Create Requests
Add all 8 endpoint requests with the sample bodies provided above

### 4. Run Collection
Execute the entire collection to test all email types

---

## Email Templates Preview

All emails use professional dark-themed HTML templates with:
- ✅ Responsive design
- ✅ Color-coded status indicators
- ✅ Clear call-to-action buttons
- ✅ Comprehensive information tables
- ✅ Brand consistency
- ✅ Mobile-friendly layout

---

## Integration Examples

### Integrate with BookingService
```java
@Service
public class BookingService {
    
    @Autowired
    private EmailService emailService;
    
    public void approveBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
        
        // Send email notification
        BookingApprovedEmailDTO emailDTO = new BookingApprovedEmailDTO(
            booking.getUser().getEmail(),
            booking.getUser().getName(),
            booking.getEquipment().getName(),
            booking.getEquipment().getId(),
            booking.getCreatedAt(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getEquipment().getDepartment(),
            booking.getEquipment().getDepartment(),
            "CONFIRMED",
            booking.getPurpose()
        );
        
        emailService.sendBookingApprovedEmail(emailDTO);
    }
}
```

### Integrate with WaitlistService
```java
@Service
public class WaitlistService {
    
    @Autowired
    private EmailService emailService;
    
    public void promoteFromWaitlist(Waitlist waitlistEntry, Booking newBooking) {
        // Promote logic...
        
        // Send promotion email
        WaitlistPromotionEmailDTO emailDTO = new WaitlistPromotionEmailDTO(
            waitlistEntry.getUser().getEmail(),
            waitlistEntry.getUser().getName(),
            newBooking.getEquipment().getName(),
            newBooking.getEquipment().getId(),
            newBooking.getCreatedAt(),
            newBooking.getStartTime(),
            newBooking.getEndTime(),
            "CONFIRMED",
            "You have been automatically promoted from the waitlist!",
            newBooking.getId()
        );
        
        emailService.sendWaitlistPromotionEmail(emailDTO);
    }
}
```

---

## Logging

All email operations are logged with the following information:
- 📧 Recipient email address
- 📝 Email subject/type
- ✅ Delivery status (success/failure)
- ⏰ Timestamp
- ❌ Error message (if failed)

**Example Log Output:**
```
INFO: 📧 [BOOKING APPROVED EMAIL] Sending to: researcher@university.edu
INFO: ✅ Booking approved email sent successfully to: researcher@university.edu | Equipment: HPLC | Time: 2024-07-17T19:30:00
```

---

## Configuration

Ensure your `application.properties` has the correct SMTP settings:

```properties
# SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Application Configuration
app.name=Lab Resource Utilization
app.base-url=http://localhost:5173
app.support-email=support@university.edu
```

---

## Troubleshooting

### Issue: Authentication Failed
**Solution:** Enable "Less secure app access" or use App Password for Gmail

### Issue: Email Not Received
**Solution:** Check spam folder, verify email address, check SMTP credentials

### Issue: Validation Error
**Solution:** Ensure all required fields are provided and email format is valid

---

## Security Best Practices

1. ✅ Never hardcode SMTP credentials
2. ✅ Use environment variables for sensitive data
3. ✅ Validate all email addresses before sending
4. ✅ Implement rate limiting for email endpoints
5. ✅ Use secure connection (TLS/SSL)
6. ✅ Log all email operations for audit trail

---

## Next Steps

1. Test all endpoints using Postman or cURL
2. Integrate email notifications with existing services
3. Set up automated maintenance/calibration reminders
4. Configure email templates with your branding
5. Set up monitoring for email delivery rates

---

**Version:** 1.0  
**Last Updated:** July 17, 2024  
**Status:** Production Ready ✅
