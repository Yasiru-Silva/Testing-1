package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.entity.University;
import com.sitinternational.studyabroad.entity.Program;
import com.sitinternational.studyabroad.entity.Admin;
import com.sitinternational.studyabroad.Repository.StudentRepository;
import com.sitinternational.studyabroad.Repository.UniversityRepository;
import com.sitinternational.studyabroad.Repository.ProgramRepository;
import com.sitinternational.studyabroad.enums.ApplicationStatus;
import com.sitinternational.studyabroad.dto.ApplicationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UniversityRepository universityRepository;

    @Autowired
    private ProgramRepository programRepository;

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long studentId) {
        return studentRepository.findById(studentId);
    }

    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    public void deleteStudent(Long studentId) {
        studentRepository.deleteById(studentId);
    }

    public boolean existsByEmail(String email) {
        return studentRepository.existsByEmail(email);
    }

    // Application-related methods
    public Student submitApplication(ApplicationRequest request) {
        // Get the student
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + request.getStudentId()));
        
        // Get university and program
        University university = universityRepository.findById(request.getUniversityId())
                .orElseThrow(() -> new RuntimeException("University not found with ID: " + request.getUniversityId()));
        
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new RuntimeException("Program not found with ID: " + request.getProgramId()));

        // Update student with application data
        student.setApplicationType(request.getApplicationType());
        student.setApplicationStatus(ApplicationStatus.SUBMITTED);
        student.setMotivationLetter(request.getMotivationLetter());
        student.setCvFilePath(request.getCvFilePath());
        student.setUniversity(university);
        student.setProgram(program);
        student.setApplicationDate(java.time.LocalDateTime.now());

        return studentRepository.save(student);
    }

    public List<Student> getStudentsWithApplications() {
        return studentRepository.findByApplicationStatusIsNotNull();
    }

    public List<Student> getStudentsByApplicationStatus(ApplicationStatus status) {
        return studentRepository.findByApplicationStatus(status);
    }

    public Student updateApplicationStatus(Long studentId, ApplicationStatus status) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        
        student.setApplicationStatus(status);
        return studentRepository.save(student);
    }

}
