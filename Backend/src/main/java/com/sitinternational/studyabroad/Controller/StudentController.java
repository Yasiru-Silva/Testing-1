package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.Service.ApplicationService;
import com.sitinternational.studyabroad.Service.StudentService;
import com.sitinternational.studyabroad.dto.ApplicationRequest;
import com.sitinternational.studyabroad.enums.ApplicationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ApplicationService applicationService;


    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        if (studentService.existsByEmail(student.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        Student saved = studentService.saveStudent(student);
        return ResponseEntity.ok(saved);
    }


    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }


    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Student> getStudentByEmail(@PathVariable String email) {
        return studentService.getStudentByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }



    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        return studentService.getStudentById(id)
                .map(student -> {
                    student.setFirstName(studentDetails.getFirstName());
                    student.setLastName(studentDetails.getLastName());
                    student.setEmail(studentDetails.getEmail());
                    student.setPhoneNumber(studentDetails.getPhoneNumber());
                    student.setGender(studentDetails.getGender());
                    student.setDateOfBirth(studentDetails.getDateOfBirth());
                    student.setCurrentAddress(studentDetails.getCurrentAddress());
                    Student updated = studentService.saveStudent(student);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (studentService.getStudentById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // Application-related endpoints
    @PostMapping("/{id}/application")
    public ResponseEntity<?> submitApplication(@PathVariable Long id, @RequestBody ApplicationRequest request) {
        try {
            // Set the student ID from the path variable
            request.setStudentId(id);
            
            // Validate request data
            if (request.getUniversityId() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"University ID is required\"}");
            }
            if (request.getProgramId() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Program ID is required\"}");
            }
            
            // Update student convenience fields for quick views
            Student updatedStudent = studentService.submitApplication(request);

            // Also create a proper Application record for admin review and payments
            try {
                applicationService.createApplication(request);
            } catch (Exception e) {
                System.err.println("Warning: Application entity creation failed after student update: " + e.getMessage());
            }

            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            System.err.println("Error submitting application: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            System.err.println("Unexpected error submitting application: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Internal server error\"}");
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Student>> getStudentsWithApplications() {
        try {
            List<Student> students = studentService.getStudentsWithApplications();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            System.err.println("Error getting students with applications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/applications/status/{status}")
    public ResponseEntity<List<Student>> getStudentsByApplicationStatus(@PathVariable ApplicationStatus status) {
        try {
            List<Student> students = studentService.getStudentsByApplicationStatus(status);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            System.err.println("Error getting students by application status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PatchMapping("/{id}/application/status")
    public ResponseEntity<Student> updateApplicationStatus(@PathVariable Long id, @RequestParam ApplicationStatus status) {
        try {
            Student updatedStudent = studentService.updateApplicationStatus(id, status);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            System.err.println("Error updating application status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            System.err.println("Unexpected error updating application status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

}
