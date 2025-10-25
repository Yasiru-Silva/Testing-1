package com.sitinternational.studyabroad.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final String CV_UPLOAD_DIR = "uploads/cvs/";

    @PostMapping("/upload-cv")
    public ResponseEntity<?> uploadCV(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== CV UPLOAD REQUEST ===");
            System.out.println("[DEBUG] File name: " + file.getOriginalFilename());
            System.out.println("[DEBUG] File size: " + file.getSize());
            System.out.println("[DEBUG] Content type: " + file.getContentType());

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("File is empty"));
            }

            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(createErrorResponse("File size exceeds 5MB limit"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (!isValidCVFile(contentType)) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid file type. Only PDF, DOC, and DOCX files are allowed"));
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(CV_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("[DEBUG] Created directory: " + uploadPath.toAbsolutePath());
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("[SUCCESS] CV file saved to: " + filePath.toAbsolutePath());

            // Return file path that can be stored in database and accessed via browser
            String accessiblePath = "/uploads/cvs/" + uniqueFilename;
            
            Map<String, String> response = new HashMap<>();
            response.put("filePath", accessiblePath);
            response.put("fileName", originalFilename);
            response.put("message", "CV uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            System.err.println("[ERROR] Failed to upload CV: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Failed to upload file: " + e.getMessage()));
        }
    }

    private boolean isValidCVFile(String contentType) {
        return contentType != null && (
            contentType.equals("application/pdf") ||
            contentType.equals("application/msword") ||
            contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        );
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}

