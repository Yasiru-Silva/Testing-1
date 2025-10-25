package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.ContactMessage;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.entity.Program;
import com.sitinternational.studyabroad.entity.Admin;
import com.sitinternational.studyabroad.enums.MessageType;
import com.sitinternational.studyabroad.Repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class ContactMessageService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    //  Create or update a contact message
    public ContactMessage saveMessage(ContactMessage message) {
        return contactMessageRepository.save(message);
    }

    //  Get all messages
    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAll();
    }

    //  Get message by ID
    public Optional<ContactMessage> getMessageById(Long id) {
        return contactMessageRepository.findById(id);
    }

    //  Get messages by student
    public List<ContactMessage> getMessagesByStudent(Student student) {
        return contactMessageRepository.findByStudent(student);
    }

    //  Get messages by program
    public List<ContactMessage> getMessagesByProgram(Program program) {
        return contactMessageRepository.findByProgram(program);
    }

    //  Get messages by admin
    public List<ContactMessage> getMessagesByAdmin(Admin admin) {
        return contactMessageRepository.findByAdmin(admin);
    }

    //  Get messages by type
    public List<ContactMessage> getMessagesByType(MessageType type) {
        return contactMessageRepository.findByMessageType(type);
    }

    //  Get unread messages count
    public Long getUnreadMessagesCount() {
        return contactMessageRepository.countByIsReadFalse();
    }

    //  Get messages by read status
    public List<ContactMessage> getMessagesByReadStatus(Boolean isRead) {
        return contactMessageRepository.findByIsRead(isRead);
    }

    //  Get messages by response status
    public List<ContactMessage> getMessagesByResponseStatus(Boolean isResponded) {
        return contactMessageRepository.findByIsResponded(isResponded);
    }

    //  Delete message
    public void deleteMessage(Long id) {
        contactMessageRepository.deleteById(id);
    }
}


