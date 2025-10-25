package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.Payment;
import com.sitinternational.studyabroad.entity.Application;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.enums.PaymentStatus;
import com.sitinternational.studyabroad.Repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AdminNotificationService adminNotificationService;

    public Payment savePayment(Payment payment) {
        Payment savedPayment = paymentRepository.save(payment);
        
        // Send payment confirmation email
        try {
            Application application = payment.getApplication();
            if (application != null && application.getStudent() != null) {
                Student student = application.getStudent();
                emailService.sendPaymentConfirmationEmail(student, savedPayment);
            }
        } catch (Exception e) {
            System.err.println("Failed to send payment confirmation email: " + e.getMessage());
        }
        
        return savedPayment;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public List<Payment> getPaymentsByApplication(Application application) {
        return paymentRepository.findByApplication(application);
    }

    public Payment approvePayment(Payment payment) {
        payment.setStatus(PaymentStatus.APPROVED);
        payment.setApprovedAt(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);
        
        // Create in-app notification for student
        try {
            Application application = payment.getApplication();
            if (application != null && application.getStudent() != null) {
                Student student = application.getStudent();
                String message = String.format("Great news! Your payment of $%.2f for %s has been approved and processed successfully.", 
                    payment.getAmount(), 
                    application.getProgram() != null ? application.getProgram().getProgramName() : "your application");
                adminNotificationService.createApplicationNotification(student, message);
                System.out.println("✅ Student notification created for payment approval: " + student.getEmail());
            }
        } catch (Exception e) {
            System.err.println("Failed to create payment approval notification: " + e.getMessage());
        }
        
        return savedPayment;
    }

    public Payment rejectPayment(Payment payment, String reason) {
        payment.setStatus(PaymentStatus.REJECTED);
        payment.setRejectionReason(reason);
        Payment savedPayment = paymentRepository.save(payment);
        
        // Create in-app notification for student
        try {
            Application application = payment.getApplication();
            if (application != null && application.getStudent() != null) {
                Student student = application.getStudent();
                String message = String.format("Your payment of $%.2f has been reviewed. Reason: %s. Please resubmit your payment or contact support for assistance.", 
                    payment.getAmount(), 
                    reason != null && !reason.isEmpty() ? reason : "Payment verification failed");
                adminNotificationService.createApplicationNotification(student, message);
                System.out.println("✅ Student notification created for payment rejection: " + student.getEmail());
            }
        } catch (Exception e) {
            System.err.println("Failed to create payment rejection notification: " + e.getMessage());
        }
        
        return savedPayment;
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }
}
