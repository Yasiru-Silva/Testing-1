package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.Repository.ApplicationRepository;
import com.sitinternational.studyabroad.Repository.StudentRepository;
import com.sitinternational.studyabroad.Repository.UniversityRepository;
import com.sitinternational.studyabroad.Repository.ProgramRepository;
import com.sitinternational.studyabroad.entity.*;
import com.sitinternational.studyabroad.enums.ApplicationStatus;
import com.sitinternational.studyabroad.dto.ApplicationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UniversityRepository universityRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AdminNotificationService adminNotificationService;

    //  Create new application from request
    public Application createApplication(ApplicationRequest request) {
        // Validate and get entities
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + request.getStudentId()));
        
        University university = universityRepository.findById(request.getUniversityId())
                .orElseThrow(() -> new RuntimeException("University not found with ID: " + request.getUniversityId()));
        
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new RuntimeException("Program not found with ID: " + request.getProgramId()));

        // Create application entity
        Application application = Application.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .country(request.getCountry())
                .address(request.getAddress())
                .motivationLetter(request.getMotivationLetter())
                .applicationType(request.getApplicationType())
                .cvFilePath(request.getCvFilePath())
                .student(student)
                .university(university)
                .program(program)
                .applicationStatus(ApplicationStatus.PENDING)
                .build();

        Application savedApplication = applicationRepository.save(application);
        
        // Send application confirmation email
        try {
            emailService.sendApplicationConfirmationEmail(student, savedApplication);
        } catch (Exception e) {
            System.err.println("Failed to send application confirmation email: " + e.getMessage());
        }
        
        return savedApplication;
    }

    //  Create or update application
    public Application saveApplication(Application application) {
        // Validate and set relationships
        if (application.getStudent() != null && application.getStudent().getStudentId() != null) {
            Optional<Student> studentOpt = studentRepository.findById(application.getStudent().getStudentId());
            if (studentOpt.isPresent()) {
                application.setStudent(studentOpt.get());
            } else {
                throw new RuntimeException("Student not found with ID: " + application.getStudent().getStudentId());
            }
        }
        
        if (application.getUniversity() != null && application.getUniversity().getUniversityId() != null) {
            Optional<University> universityOpt = universityRepository.findById(application.getUniversity().getUniversityId());
            if (universityOpt.isPresent()) {
                application.setUniversity(universityOpt.get());
            } else {
                throw new RuntimeException("University not found with ID: " + application.getUniversity().getUniversityId());
            }
        }
        
        if (application.getProgram() != null && application.getProgram().getProgramId() != null) {
            Optional<Program> programOpt = programRepository.findById(application.getProgram().getProgramId());
            if (programOpt.isPresent()) {
                application.setProgram(programOpt.get());
            } else {
                throw new RuntimeException("Program not found with ID: " + application.getProgram().getProgramId());
            }
        }
        
        Application savedApplication = applicationRepository.save(application);
        
        // Send application confirmation email if this is a new application
        if (application.getApplicationId() == null) {
            // This is a new application, send confirmation email
            try {
                Student student = savedApplication.getStudent();
                if (student != null) {
                    emailService.sendApplicationConfirmationEmail(student, savedApplication);
                }
            } catch (Exception e) {
                System.err.println("Failed to send application confirmation email: " + e.getMessage());
            }
        }
        
        return savedApplication;
    }

    // Get all applications
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    //  Get by ID
    public Optional<Application> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    // Get by student ID
    public List<Application> getApplicationsByStudent(Long studentId) {
        return studentRepository.findById(studentId)
                .map(applicationRepository::findByStudent)
                .orElse(List.of());
    }

    //  Get by university ID
    public List<Application> getApplicationsByUniversity(Long universityId) {
        return universityRepository.findById(universityId)
                .map(applicationRepository::findByUniversity)
                .orElse(List.of());
    }

    //  Get by program ID
    public List<Application> getApplicationsByProgram(Long programId) {
        return programRepository.findById(programId)
                .map(applicationRepository::findByProgram)
                .orElse(List.of());
    }

    //  Get by application status
    public List<Application> getApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.findByApplicationStatus(status);
    }

    //  Delete by ID
    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    // Update application status and send notification email
    public Application updateApplicationStatus(Long applicationId, ApplicationStatus newStatus) {
        Optional<Application> applicationOpt = applicationRepository.findById(applicationId);
        if (applicationOpt.isPresent()) {
            Application application = applicationOpt.get();
            application.setApplicationStatus(newStatus);
            Application updatedApplication = applicationRepository.save(application);
            
            Student student = application.getStudent();
            if (student != null) {
                // Send status update email
                try {
                    emailService.sendApplicationStatusUpdateEmail(student, updatedApplication);
                } catch (Exception e) {
                    System.err.println("Failed to send application status update email: " + e.getMessage());
                }
                
                // Create in-app notification for student
                try {
                    String notificationMessage = createStatusUpdateMessage(newStatus, application);
                    adminNotificationService.createApplicationNotification(student, notificationMessage);
                    System.out.println("✅ Student notification created for application status update: " + student.getEmail());
                } catch (Exception e) {
                    System.err.println("Failed to create student notification: " + e.getMessage());
                }
            }
            
            return updatedApplication;
        }
        return null;
    }

    private String createStatusUpdateMessage(ApplicationStatus status, Application application) {
        String programName = application.getProgram() != null ? application.getProgram().getProgramName() : "program";
        String universityName = application.getUniversity() != null ? application.getUniversity().getName() : "university";
        
        switch (status) {
            case APPROVED:
                return String.format("Congratulations! Your application for %s at %s has been APPROVED. Check your email for next steps.", 
                    programName, universityName);
            case REJECTED:
                return String.format("Your application for %s at %s has been reviewed. Unfortunately, we are unable to proceed with your application at this time. Please contact us for more details.", 
                    programName, universityName);
            case DOCUMENTS_REQUIRED:
                return String.format("Additional documents required for your application to %s at %s. Please upload the required documents as soon as possible.", 
                    programName, universityName);
            case SUBMITTED:
                return String.format("Your application for %s at %s has been submitted and is being reviewed. We will notify you of any updates.", 
                    programName, universityName);
            case PENDING:
                return String.format("Your application for %s at %s is pending review.", 
                    programName, universityName);
            default:
                return String.format("Your application for %s at %s status has been updated to: %s", 
                    programName, universityName, status.toString());
        }
    }
}

