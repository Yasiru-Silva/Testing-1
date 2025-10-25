package com.sitinternational.studyabroad.dto;

import com.sitinternational.studyabroad.enums.ApplicationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ApplicationRequest {
    
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;
    
    @Size(max = 10, message = "Gender must not exceed 10 characters")
    private String gender;
    
    private LocalDate dateOfBirth;
    
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    @Size(max = 200, message = "Address must not exceed 200 characters")
    private String address;
    
    @Size(max = 2000, message = "Motivation letter must not exceed 2000 characters")
    private String motivationLetter;
    
    @NotNull(message = "Application type is required")
    private ApplicationType applicationType;
    
    private String cvFilePath;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotNull(message = "University ID is required")
    private Long universityId;
    
    @NotNull(message = "Program ID is required")
    private Long programId;
}




















