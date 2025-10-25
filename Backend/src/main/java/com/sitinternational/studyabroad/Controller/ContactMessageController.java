package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.entity.ContactMessage;
import com.sitinternational.studyabroad.enums.MessageType;
import com.sitinternational.studyabroad.Service.ContactMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact-messages")
@CrossOrigin(origins = "*")
public class ContactMessageController {

    @Autowired
    private ContactMessageService contactMessageService;

    //  Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Contact messages endpoint is working!");
    }

    //  Create or send a new contact message
    @PostMapping
    public ResponseEntity<ContactMessage> createMessage(@RequestBody ContactMessage message) {
        try {
            System.out.println("Received contact message: " + message);
            ContactMessage saved = contactMessageService.saveMessage(message);
            System.out.println("Saved contact message: " + saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("Error creating contact message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    //  Get all messages
    @GetMapping
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactMessageService.getAllMessages());
    }

    //  Get message by ID
    @GetMapping("/{id}")
    public ResponseEntity<ContactMessage> getMessageById(@PathVariable Long id) {
        return contactMessageService.getMessageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //  Get messages by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ContactMessage>> getMessagesByType(@PathVariable String type) {
        try {
            MessageType messageType = MessageType.valueOf(type.toUpperCase());
            return ResponseEntity.ok(contactMessageService.getMessagesByType(messageType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build(); // invalid type provided
        }
    }

    //  Update message (admin can respond)
    @PutMapping("/{id}")
    public ResponseEntity<ContactMessage> updateMessage(@PathVariable Long id, @RequestBody ContactMessage updated) {
        try {
            return contactMessageService.getMessageById(id)
                    .map(existing -> {
                        existing.setResponseContent(updated.getResponseContent());
                        existing.setAdmin(updated.getAdmin());
                        existing.setIsResponded(true);
                        existing.setIsRead(true);
                        ContactMessage saved = contactMessageService.saveMessage(existing);
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error updating contact message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    //  Mark message as read
    @PatchMapping("/{id}/mark-read")
    public ResponseEntity<ContactMessage> markAsRead(@PathVariable Long id) {
        try {
            return contactMessageService.getMessageById(id)
                    .map(message -> {
                        message.setIsRead(true);
                        ContactMessage saved = contactMessageService.saveMessage(message);
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error marking message as read: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    //  Get unread messages count
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        try {
            Long count = contactMessageService.getUnreadMessagesCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(0L);
        }
    }

    //  Delete message
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        if (contactMessageService.getMessageById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        contactMessageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}



