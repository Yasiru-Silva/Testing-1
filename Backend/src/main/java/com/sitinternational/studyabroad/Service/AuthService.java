package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.dto.LoginRequest;
import com.sitinternational.studyabroad.dto.LoginResponse;
import com.sitinternational.studyabroad.dto.RegisterRequest;
import com.sitinternational.studyabroad.entity.Admin;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.enums.Role;
import com.sitinternational.studyabroad.Repository.AdminRepository;
import com.sitinternational.studyabroad.Repository.StudentRepository;
import com.sitinternational.studyabroad.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AdminNotificationService adminNotificationService;

    @Autowired
    private EmailService emailService;

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        String token = jwtTokenProvider.generateToken(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // Determine user type and get additional info
        String userType = "STUDENT";
        String role = "ROLE_STUDENT";
        Long userId = null;
        String firstName = null;
        String lastName = null;
        
        if (userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().startsWith("ROLE_ADMIN"))) {
            userType = "ADMIN";
            role = userDetails.getAuthorities().iterator().next().getAuthority();
            
            // Get admin info
            Admin admin = adminRepository.findByEmail(userDetails.getUsername()).orElse(null);
            if (admin != null) {
                userId = admin.getAdminId();
                firstName = admin.getFirstName();
                lastName = admin.getLastName();
            }
        } else {
            // Get student info
            Student student = studentRepository.findByEmail(userDetails.getUsername()).orElse(null);
            if (student != null) {
                userId = student.getStudentId();
                firstName = student.getFirstName();
                lastName = student.getLastName();
            }
        }

        return new LoginResponse(token, userType, role, userDetails.getUsername(), userId, firstName, lastName);
    }

    public Student registerStudent(RegisterRequest registerRequest) {
        if (studentRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Student student = Student.builder()
            .firstName(registerRequest.getFirstName())
            .lastName(registerRequest.getLastName())
            .email(registerRequest.getEmail())
            .phoneNumber(registerRequest.getPhone())
            .country(registerRequest.getCountry())
            .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
            .build();

        Student savedStudent = studentRepository.save(student);
        
        // Create admin notification for new student signup
        adminNotificationService.createUserSignupNotification(savedStudent);
        
        // Send welcome email to student
        emailService.sendWelcomeEmail(savedStudent);
        
        return savedStudent;
    }

    public Admin registerAdmin(RegisterRequest registerRequest) {
        if (adminRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Admin admin = Admin.builder()
            .firstName(registerRequest.getFirstName())
            .lastName(registerRequest.getLastName())
            .email(registerRequest.getEmail())
            .phone(registerRequest.getPhone())
            .password(passwordEncoder.encode(registerRequest.getPassword()))
            .role(Role.ADMIN)
            .isActive(true)
            .build();

        return adminRepository.save(admin);
    }
}
