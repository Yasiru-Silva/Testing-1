package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.dto.LoginRequest;
import com.sitinternational.studyabroad.dto.LoginResponse;
import com.sitinternational.studyabroad.dto.RegisterRequest;
import com.sitinternational.studyabroad.entity.Admin;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("{\"error\": \"Invalid credentials\"}");
        }
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            System.out.println("🔍 Registering student: " + registerRequest.getEmail());
            System.out.println("📝 Request details: " + registerRequest.toString());
            
            Student student = authService.registerStudent(registerRequest);
            
            System.out.println("✅ Student registered successfully: " + student.getStudentId());
            return ResponseEntity.status(HttpStatus.CREATED).body(student);
        } catch (RuntimeException e) {
            System.err.println("❌ Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            System.err.println("❌ Unexpected registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Registration failed: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            Admin admin = authService.registerAdmin(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(admin);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Registration failed\"}");
        }
    }
}
