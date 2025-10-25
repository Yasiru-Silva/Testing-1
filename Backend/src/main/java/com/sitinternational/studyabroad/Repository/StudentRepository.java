package com.sitinternational.studyabroad.Repository;

import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    // Application-related queries
    List<Student> findByApplicationStatusIsNotNull();

    List<Student> findByApplicationStatus(ApplicationStatus status);
}
