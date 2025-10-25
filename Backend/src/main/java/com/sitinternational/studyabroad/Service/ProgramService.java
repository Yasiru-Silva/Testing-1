package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.Program;
import com.sitinternational.studyabroad.entity.University;
import com.sitinternational.studyabroad.enums.ApplicationType;
import com.sitinternational.studyabroad.enums.Status;
import com.sitinternational.studyabroad.Repository.ProgramRepository;
import com.sitinternational.studyabroad.Repository.UniversityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgramService {

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private UniversityRepository universityRepository;

    public Program saveProgram(Program program) {
        return programRepository.save(program);
    }

    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    public Optional<Program> getProgramById(Long id) {
        return programRepository.findById(id);
    }

    public List<Program> getProgramsByUniversity(Long universityId) {
        return programRepository.findByUniversityUniversityId(universityId);
    }

    public List<Program> getProgramsByDegreeType(ApplicationType type) {
        return programRepository.findByDegreeType(type);
    }

    public List<Program> getProgramsByStatus(Status status) {
        return programRepository.findByStatus(status);
    }

    public void deleteProgram(Long id) {
        programRepository.deleteById(id);
    }

    public boolean existsByProgramNameAndUniversity(String programName, University university) {
        return programRepository.existsByProgramNameAndUniversity(programName, university);
    }
}
