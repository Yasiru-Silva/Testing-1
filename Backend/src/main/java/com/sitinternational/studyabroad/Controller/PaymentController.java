package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.entity.Payment;
import com.sitinternational.studyabroad.entity.Application;
import com.sitinternational.studyabroad.enums.PaymentStatus;
import com.sitinternational.studyabroad.Service.PaymentService;
import com.sitinternational.studyabroad.Service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.MediaType;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ApplicationService applicationService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> uploadPaymentSlip(
            @RequestPart(value = "payment") String paymentJson,
            @RequestPart(value = "slipFile", required = false) MultipartFile slipFile,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            System.out.println("=== PAYMENT UPLOAD REQUEST ===");
            System.out.println("[DEBUG] Authorization header: " + request.getHeader("Authorization"));
            System.out.println("[DEBUG] Content-Type: " + request.getContentType());
            System.out.println("[DEBUG] Method: " + request.getMethod());
            System.out.println("[DEBUG] Authenticated: " + (org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null));
            System.out.println("[DEBUG] Received payment JSON: " + paymentJson);
            if (slipFile != null) {
                System.out.println("[DEBUG] Received slipFile name=" + slipFile.getOriginalFilename() + ", size=" + slipFile.getSize());
            } else {
                System.out.println("[DEBUG] No slipFile uploaded");
            }

            // Parse JSON manually
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> paymentMap = objectMapper.readValue(paymentJson, java.util.Map.class);
            System.out.println("[DEBUG] Parsed payment map: " + paymentMap);
            
            // Extract application ID
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> applicationMap = (java.util.Map<String, Object>) paymentMap.get("application");
            if (applicationMap == null) {
                System.err.println("[ERROR] Application map is null");
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Application ID is required"));
            }
            
            Long applicationId = ((Number) applicationMap.get("applicationId")).longValue();
            System.out.println("[DEBUG] Application ID: " + applicationId);
            
            Optional<Application> appOpt = applicationService.getApplicationById(applicationId);
            if (appOpt.isEmpty()) {
                System.err.println("[ERROR] Application not found: " + applicationId);
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Application not found"));
            }

            Application application = appOpt.get();
            // Force load to avoid lazy loading issues
            if (application.getStudent() != null) {
                application.getStudent().getEmail(); // Touch to load
            }
            System.out.println("[DEBUG] Application loaded: " + application.getApplicationId());

            // Build Payment object
            Payment payment = new Payment();
            payment.setApplication(application);
            payment.setAmount(((Number) paymentMap.get("amount")).doubleValue());
            payment.setPaymentMethod((String) paymentMap.get("paymentMethod"));
            payment.setTransactionReference((String) paymentMap.get("transactionReference"));
            
            Object notesObj = paymentMap.get("notes");
            payment.setNotes(notesObj != null ? notesObj.toString() : "");
            payment.setUploadedAt(LocalDateTime.now());

            System.out.println("[DEBUG] Payment object created: " + payment.getAmount() + ", " + payment.getPaymentMethod());

            // If a file was uploaded, save it to disk and set the path on the entity
            if (slipFile != null && !slipFile.isEmpty()) {
                System.out.println("[DEBUG] Saving file...");
                
                // Create uploads directory in the project root (absolute path)
                // Get the current working directory (project root)
                String projectRoot = System.getProperty("user.dir");
                Path uploadsDir = Paths.get(projectRoot, "uploads", "payments");
                
                // Create directory if it doesn't exist
                Files.createDirectories(uploadsDir);
                System.out.println("[DEBUG] Uploads directory: " + uploadsDir.toAbsolutePath());
                
                // Generate unique filename
                String originalFilename = slipFile.getOriginalFilename();
                String sanitizedFilename = originalFilename != null ? originalFilename.replace(" ", "_") : "payment_slip";
                String filename = System.currentTimeMillis() + "_" + sanitizedFilename;
                Path filePath = uploadsDir.resolve(filename);
                
                // Save the file to absolute path
                slipFile.transferTo(filePath.toFile());
                
                // Store web-accessible relative path in database
                String webAccessiblePath = "/uploads/payments/" + filename;
                payment.setSlipFilePath(webAccessiblePath);
                System.out.println("[DEBUG] File saved to: " + filePath.toAbsolutePath());
                System.out.println("[DEBUG] Web path: " + webAccessiblePath);
            }

            System.out.println("[DEBUG] Saving payment to database...");
            Payment saved = paymentService.savePayment(payment);
            System.out.println("[DEBUG] Payment saved successfully with ID: " + saved.getPaymentId());
            
            // Return simple response to avoid serialization issues
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("paymentId", saved.getPaymentId());
            response.put("amount", saved.getAmount());
            response.put("status", saved.getStatus().toString());
            response.put("transactionReference", saved.getTransactionReference());
            response.put("uploadedAt", saved.getUploadedAt().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[ERROR] Exception in payment upload: " + e.getClass().getName());
            System.err.println("[ERROR] Message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", "Failed to upload payment",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Payment>> getPaymentsByApplication(@PathVariable Long applicationId) {
        Optional<Application> appOpt = applicationService.getApplicationById(applicationId);
        if (appOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(paymentService.getPaymentsByApplication(appOpt.get()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Payment> updatePaymentStatus(@PathVariable Long id,
                                                       @RequestParam PaymentStatus status,
                                                       @RequestParam(required = false) String reason) {
        Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
        if (paymentOpt.isEmpty()) return ResponseEntity.notFound().build();

        Payment payment = paymentOpt.get();
        if (status == PaymentStatus.APPROVED) {
            return ResponseEntity.ok(paymentService.approvePayment(payment));
        } else if (status == PaymentStatus.REJECTED) {
            return ResponseEntity.ok(paymentService.rejectPayment(payment, reason));
        } else {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
        if (paymentOpt.isEmpty()) return ResponseEntity.notFound().build();

        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/slip")
    public ResponseEntity<org.springframework.core.io.Resource> downloadPaymentSlip(@PathVariable Long id) {
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Payment payment = paymentOpt.get();
            if (payment.getSlipFilePath() == null || payment.getSlipFilePath().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(payment.getSlipFilePath());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(resource);
        } catch (Exception e) {
            System.err.println("Error retrieving payment slip: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}

