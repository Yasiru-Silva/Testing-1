package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.NotificationLog;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.Repository.NotificationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationLogService {

    @Autowired
    private NotificationLogRepository repository;

    public NotificationLog saveNotification(NotificationLog notificationLog) {
        return repository.save(notificationLog);
    }

    public List<NotificationLog> getAllNotifications() {
        return repository.findAll();
    }

    public Optional<NotificationLog> getNotificationById(Long id) {
        return repository.findById(id);
    }

    public List<NotificationLog> getNotificationsByStudent(Student student) {
        return repository.findByStudent(student);
    }

    public void deleteNotification(Long id) {
        repository.deleteById(id);
    }

    public List<NotificationLog> getAdminNotifications() {
        return repository.findByStudentIsNull();
    }

    public Optional<NotificationLog> markAsRead(Long id) {
        Optional<NotificationLog> notification = repository.findById(id);
        if (notification.isPresent()) {
            NotificationLog notif = notification.get();
            notif.setStatus(com.sitinternational.studyabroad.enums.NotificationStatus.DELIVERED);
            notif.setDeliveredAt(java.time.LocalDateTime.now());
            return Optional.of(repository.save(notif));
        }
        return Optional.empty();
    }
}

