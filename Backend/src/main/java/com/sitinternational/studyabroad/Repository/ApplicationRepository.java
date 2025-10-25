package com.sitinternational.studyabroad.Repository;

import com.sitinternational.studyabroad.entity.Application;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.entity.Program;
import com.sitinternational.studyabroad.entity.University;
import com.sitinternational.studyabroad.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByStudent(Student student);

    List<Application> findByUniversity(University university);

    List<Application> findByProgram(Program program);

    List<Application> findByApplicationStatus(ApplicationStatus status);
}
