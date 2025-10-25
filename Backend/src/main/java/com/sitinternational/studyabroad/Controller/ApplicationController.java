package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.Service.ApplicationService;
import com.sitinternational.studyabroad.entity.Application;
import com.sitinternational.studyabroad.enums.ApplicationStatus;
import com.sitinternational.studyabroad.dto.ApplicationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    //  Create new application
    @PostMapping
    public ResponseEntity<?> createApplication(@RequestBody ApplicationRequest request) {
        try {
            // Validate request data
            if (request.getStudentId() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Student ID is required\"}");
            }
            if (request.getUniversityId() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"University ID is required\"}");
            }
            if (request.getProgramId() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Program ID is required\"}");
            }
            
            Application saved = applicationService.createApplication(request);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            System.err.println("Error creating application: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            System.err.println("Unexpected error creating application: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Internal server error\"}");
        }
    }

    //  Get all applications
    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        try {
            List<Application> applications = applicationService.getAllApplications();
            System.out.println("Found " + applications.size() + " applications");
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            System.err.println("Error in getAllApplications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    //  Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //  Get applications by student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Application>> getApplicationsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(applicationService.getApplicationsByStudent(studentId));
    }

    //  Get applications by university
    @GetMapping("/university/{universityId}")
    public ResponseEntity<List<Application>> getApplicationsByUniversity(@PathVariable Long universityId) {
        return ResponseEntity.ok(applicationService.getApplicationsByUniversity(universityId));
    }

    //  Get applications by program
    @GetMapping("/program/{programId}")
    public ResponseEntity<List<Application>> getApplicationsByProgram(@PathVariable Long programId) {
        return ResponseEntity.ok(applicationService.getApplicationsByProgram(programId));
    }

    //  Get applications by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Application>> getApplicationsByStatus(@PathVariable ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.getApplicationsByStatus(status));
    }

    //  Update application
    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(@PathVariable Long id, @RequestBody Application details) {
        return applicationService.getApplicationById(id)
                .map(application -> {
                    application.setFirstName(details.getFirstName());
                    application.setLastName(details.getLastName());
                    application.setEmail(details.getEmail());
                    application.setPhoneNumber(details.getPhoneNumber());
                    application.setGender(details.getGender());
                    application.setApplicationStatus(details.getApplicationStatus());
                    application.setCvFilePath(details.getCvFilePath());
                    Application updated = applicationService.saveApplication(application);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    //  Update application status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Application> updateApplicationStatus(@PathVariable Long id, @RequestParam ApplicationStatus status) {
        Application updated = applicationService.updateApplicationStatus(id, status);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //  Delete application
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        if (applicationService.getApplicationById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}


