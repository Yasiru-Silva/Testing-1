package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.entity.NotificationLog;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.Service.NotificationLogService;
import com.sitinternational.studyabroad.Service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationLogController {

    @Autowired
    private NotificationLogService notificationService;

    @Autowired
    private StudentService studentService;

    @PostMapping
    public ResponseEntity<NotificationLog> createNotification(@RequestBody NotificationLog notification) {

        Student student = studentService.getStudentById(notification.getStudent().getStudentId())
                .orElse(null);
        if (student == null) {
            return ResponseEntity.badRequest().build();
        }

        notification.setStudent(student);
        NotificationLog saved = notificationService.saveNotification(notification);
        return ResponseEntity.ok(saved);
    }

    // Endpoint for admins to send custom notifications to students
    @PostMapping("/send-to-student/{studentId}")
    public ResponseEntity<?> sendNotificationToStudent(
            @PathVariable Long studentId,
            @RequestBody java.util.Map<String, String> notificationData) {
        try {
            Student student = studentService.getStudentById(studentId).orElse(null);
            if (student == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Student not found\"}");
            }

            String subject = notificationData.get("subject");
            String message = notificationData.get("message");

            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Message is required\"}");
            }

            NotificationLog notification = NotificationLog.builder()
                    .student(student)
                    .type(com.sitinternational.studyabroad.enums.NotificationType.GENERAL)
                    .message(message)
                    .subject(subject != null ? subject : "Message from Admin")
                    .status(com.sitinternational.studyabroad.enums.NotificationStatus.SENT)
                    .sentAt(java.time.LocalDateTime.now())
                    .build();

            NotificationLog saved = notificationService.saveNotification(notification);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Failed to send notification: " + e.getMessage() + "\"}");
        }
    }


    @GetMapping
    public ResponseEntity<List<NotificationLog>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }


    @GetMapping("/{id}")
    public ResponseEntity<NotificationLog> getNotificationById(@PathVariable Long id) {
        return notificationService.getNotificationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<NotificationLog>> getNotificationsByStudent(@PathVariable Long studentId) {
        Student student = studentService.getStudentById(studentId).orElse(null);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notificationService.getNotificationsByStudent(student));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<NotificationLog>> getAdminNotifications() {
        return ResponseEntity.ok(notificationService.getAdminNotifications());
    }

    @PutMapping("/{id}/mark-read")
    public ResponseEntity<NotificationLog> markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        if (notificationService.getNotificationById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
