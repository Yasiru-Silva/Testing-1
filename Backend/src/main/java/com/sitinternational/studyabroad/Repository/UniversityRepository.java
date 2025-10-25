package com.sitinternational.studyabroad.Repository;

import com.sitinternational.studyabroad.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniversityRepository extends JpaRepository<University, Long> {

    Optional<University> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
