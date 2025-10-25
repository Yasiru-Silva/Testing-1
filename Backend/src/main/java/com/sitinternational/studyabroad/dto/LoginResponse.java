package com.sitinternational.studyabroad.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String userType;
    private String role;
    private String email;
    private Long userId; // This will be studentId for students or adminId for admins
    private String firstName;
    private String lastName;
}
