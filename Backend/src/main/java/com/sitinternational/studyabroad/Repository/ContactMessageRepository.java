package com.sitinternational.studyabroad.Repository;

import com.sitinternational.studyabroad.entity.ContactMessage;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.entity.Program;
import com.sitinternational.studyabroad.entity.Admin;
import com.sitinternational.studyabroad.enums.MessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    List<ContactMessage> findByStudent(Student student);

    List<ContactMessage> findByProgram(Program program);

    List<ContactMessage> findByAdmin(Admin admin);

    List<ContactMessage> findByMessageType(MessageType messageType);

    List<ContactMessage> findByIsRead(Boolean isRead);

    List<ContactMessage> findByIsResponded(Boolean isResponded);

    Long countByIsReadFalse();

}

