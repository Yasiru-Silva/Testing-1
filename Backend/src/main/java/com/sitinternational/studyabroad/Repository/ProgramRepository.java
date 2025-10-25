package com.sitinternational.studyabroad.Repository;

import com.sitinternational.studyabroad.entity.Program;
import com.sitinternational.studyabroad.entity.University;
import com.sitinternational.studyabroad.enums.ApplicationType;
import com.sitinternational.studyabroad.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {

    List<Program> findByUniversity(University university);
    
    List<Program> findByUniversityUniversityId(Long universityId);

    List<Program> findByDegreeType(ApplicationType degreeType);

    List<Program> findByStatus(Status status);

    boolean existsByProgramNameAndUniversity(String programName, University university);
}
