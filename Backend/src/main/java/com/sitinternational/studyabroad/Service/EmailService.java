package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.entity.Application;
import com.sitinternational.studyabroad.entity.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    public void sendWelcomeEmail(Student student) {
        try {
            String subject = "Welcome to SIT International Study Abroad Portal";
            String htmlContent = createWelcomeEmailTemplate(student);
            
            sendHtmlEmail(student.getEmail(), subject, htmlContent);
            System.out.println("✅ Welcome email sent to: " + student.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send welcome email to " + student.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendApplicationConfirmationEmail(Student student, Application application) {
        try {
            String subject = "Application Submitted - SIT International Study Abroad Portal";
            String htmlContent = createApplicationConfirmationTemplate(student, application);
            
            sendHtmlEmail(student.getEmail(), subject, htmlContent);
            System.out.println("✅ Application confirmation email sent to: " + student.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send application confirmation email to " + student.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendPaymentConfirmationEmail(Student student, Payment payment) {
        try {
            String subject = "Payment Confirmation - SIT International Study Abroad Portal";
            String htmlContent = createPaymentConfirmationTemplate(student, payment);
            
            sendHtmlEmail(student.getEmail(), subject, htmlContent);
            System.out.println("✅ Payment confirmation email sent to: " + student.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send payment confirmation email to " + student.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendApplicationStatusUpdateEmail(Student student, Application application) {
        try {
            String subject = "Application Status Update - SIT International Study Abroad Portal";
            String htmlContent = createApplicationStatusUpdateTemplate(student, application);
            
            sendHtmlEmail(student.getEmail(), subject, htmlContent);
            System.out.println("✅ Application status update email sent to: " + student.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send application status update email to " + student.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    private String createWelcomeEmailTemplate(Student student) {
        Context context = new Context();
        context.setVariable("studentName", student.getFirstName() + " " + student.getLastName());
        context.setVariable("email", student.getEmail());
        context.setVariable("registrationDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        
        return templateEngine.process("welcome-email", context);
    }

    private String createApplicationConfirmationTemplate(Student student, Application application) {
        Context context = new Context();
        context.setVariable("studentName", student.getFirstName() + " " + student.getLastName());
        context.setVariable("applicationId", application.getApplicationId());
        context.setVariable("programName", application.getProgram() != null ? application.getProgram().getProgramName() : "N/A");
        context.setVariable("universityName", application.getUniversity() != null ? application.getUniversity().getName() : "N/A");
        context.setVariable("applicationDate", application.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        context.setVariable("status", application.getApplicationStatus());
        
        return templateEngine.process("application-confirmation-email", context);
    }

    private String createPaymentConfirmationTemplate(Student student, Payment payment) {
        Context context = new Context();
        context.setVariable("studentName", student.getFirstName() + " " + student.getLastName());
        context.setVariable("paymentId", payment.getPaymentId());
        context.setVariable("amount", payment.getAmount() != null ? String.format("%.2f", payment.getAmount()) : "0.00");
        context.setVariable("paymentDate", payment.getUploadedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        context.setVariable("status", payment.getStatus());
        context.setVariable("paymentMethod", payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "Bank Transfer");
        context.setVariable("transactionReference", payment.getTransactionReference() != null ? payment.getTransactionReference() : "N/A");
        
        return templateEngine.process("payment-confirmation-email", context);
    }

    private String createApplicationStatusUpdateTemplate(Student student, Application application) {
        Context context = new Context();
        context.setVariable("studentName", student.getFirstName() + " " + student.getLastName());
        context.setVariable("applicationId", application.getApplicationId());
        context.setVariable("programName", application.getProgram() != null ? application.getProgram().getProgramName() : "N/A");
        context.setVariable("universityName", application.getUniversity() != null ? application.getUniversity().getName() : "N/A");
        context.setVariable("oldStatus", "PENDING"); // You might want to track previous status
        context.setVariable("newStatus", application.getApplicationStatus());
        context.setVariable("updateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        
        return templateEngine.process("application-status-update-email", context);
    }

}
