package com.sitinternational.studyabroad.entity;

import com.sitinternational.studyabroad.enums.Status;
import com.sitinternational.studyabroad.enums.ApplicationType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "programs")
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_id")
    private Long programId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "university_id", nullable = false)
    @NotNull
    @JsonIgnoreProperties({"programs", "hibernateLazyInitializer", "handler"})
    private University university;

    @NotBlank
    @Size(max = 255)
    @Column(name = "program_name", nullable = false)
    private String programName;

    @Enumerated(EnumType.STRING)
    @Column(name = "degree_type", nullable = false)
    @NotNull
    private ApplicationType degreeType;

    @Positive
    @Column(name = "duration_years", nullable = false)
    private Integer durationYears;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "tuition_fee_usd", precision = 10, scale = 2)
    private BigDecimal tuitionFeeUsd;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
