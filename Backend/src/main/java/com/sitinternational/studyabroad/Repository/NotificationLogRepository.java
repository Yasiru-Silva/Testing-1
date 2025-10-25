package com.sitinternational.studyabroad.Repository;

import com.sitinternational.studyabroad.entity.NotificationLog;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findByStudent(Student student);

    List<NotificationLog> findByStatus(String status);
    
    List<NotificationLog> findByStudentIsNull();
    
    long countByStudentAndStatus(Student student, NotificationStatus status);
    
    long countByStudentIsNullAndStatus(NotificationStatus status);
}
