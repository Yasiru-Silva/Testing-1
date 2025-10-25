package com.sitinternational.studyabroad.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.sitinternational.studyabroad.enums.ApplicationStatus;
import com.sitinternational.studyabroad.enums.ApplicationType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(name = "name", length = 200)
    private String name; // Full name field as per requirements

    @Column(length = 100)
    private String country; // Added as per requirements

    private LocalDate dateOfBirth;

    @Column(length = 255)
    private String currentAddress;

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 10)
    private String gender;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Application-related fields
    @Enumerated(EnumType.STRING)
    @Column(name = "application_type")
    private ApplicationType applicationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_status")
    @Builder.Default
    private ApplicationStatus applicationStatus = ApplicationStatus.PENDING;

    @Column(name = "motivation_letter", columnDefinition = "TEXT")
    private String motivationLetter;

    @Column(name = "cv_file_path", length = 255)
    private String cvFilePath;

    @Column(name = "application_date")
    private LocalDateTime applicationDate;

    // Foreign key relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        // Generate full name from first and last name
        if (this.name == null && this.firstName != null && this.lastName != null) {
            this.name = this.firstName + " " + this.lastName;
        }
        // Set application date if not already set
        if (this.applicationDate == null && this.applicationStatus != null && this.applicationStatus != ApplicationStatus.PENDING) {
            this.applicationDate = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Update full name if first or last name changed
        if (this.firstName != null && this.lastName != null) {
            this.name = this.firstName + " " + this.lastName;
        }
        // Set application date if application status changed to submitted
        if (this.applicationStatus == ApplicationStatus.SUBMITTED && this.applicationDate == null) {
            this.applicationDate = LocalDateTime.now();
        }
    }
}
