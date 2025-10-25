package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.NotificationLog;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.enums.NotificationType;
import com.sitinternational.studyabroad.enums.NotificationStatus;
import com.sitinternational.studyabroad.Repository.NotificationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AdminNotificationService {

    @Autowired
    private NotificationLogRepository notificationRepository;

    public void createUserSignupNotification(Student student) {
        try {
            NotificationLog notification = NotificationLog.builder()
                .student(student)
                .type(NotificationType.USER_SIGNUP)
                .message(String.format("New student registration: %s %s (%s) has signed up for the study abroad portal.", 
                    student.getFirstName(), student.getLastName(), student.getEmail()))
                .subject("New Student Registration")
                .status(NotificationStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
            System.out.println("✅ Admin notification created for new student signup: " + student.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to create admin notification for signup: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void createApplicationNotification(Student student, String message) {
        try {
            NotificationLog notification = NotificationLog.builder()
                .student(student)
                .type(NotificationType.APPLICATION_UPDATE)
                .message(message)
                .subject("Application Update")
                .status(NotificationStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("❌ Failed to create application notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void createGeneralNotification(String message, String subject) {
        try {
            NotificationLog notification = NotificationLog.builder()
                .type(NotificationType.GENERAL)
                .message(message)
                .subject(subject)
                .status(NotificationStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("❌ Failed to create general notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}








