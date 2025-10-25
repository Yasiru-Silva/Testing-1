package com.sitinternational.studyabroad.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "universities")
public class University {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long universityId;

    @NotBlank(message = "University name is required")
    @Size(max = 255, message = "University name must not exceed 255 characters")
    @Column(name = "name", nullable = false, length = 255, unique = true)
    private String name; // Maps to name column in database

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    @Column(name = "location", nullable = false, length = 255)
    private String location; // Added as per requirements

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Added as per requirements

    @Column(name = "website", length = 255)
    private String website; // Changed from websiteUrl to website as per requirements

    @Column(name = "established", length = 50)
    private String established; // Year or date university was established (e.g., "1930")

    @Column(name = "students", length = 50)
    private String students; // Number of students (e.g., "15000+", "20,000")

    @Column(name = "rating")
    private Double rating; // University rating (e.g., 4.5 out of 5)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "university", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Program> programs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

