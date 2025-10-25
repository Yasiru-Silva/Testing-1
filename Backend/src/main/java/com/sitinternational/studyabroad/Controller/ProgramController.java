package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.entity.Program;
import com.sitinternational.studyabroad.entity.University;
import com.sitinternational.studyabroad.enums.ApplicationType;
import com.sitinternational.studyabroad.enums.Status;
import com.sitinternational.studyabroad.Service.ProgramService;
import com.sitinternational.studyabroad.Service.UniversityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    @Autowired
    private ProgramService programService;

    @Autowired
    private UniversityService universityService;


    @PostMapping
    public ResponseEntity<Program> createProgram(@RequestBody Program program) {
        if (program.getUniversity() == null || program.getUniversity().getUniversityId() == null) {
            return ResponseEntity.badRequest().build();
        }


        University university = universityService.getUniversityById(program.getUniversity().getUniversityId())
                .orElse(null);
        if (university == null) {
            return ResponseEntity.badRequest().build();
        }

        if (programService.existsByProgramNameAndUniversity(program.getProgramName(), university)) {
            return ResponseEntity.badRequest().build();
        }

        program.setUniversity(university);
        Program saved = programService.saveProgram(program);
        return ResponseEntity.ok(saved);
    }


    @GetMapping
    public ResponseEntity<List<Program>> getAllPrograms() {
        return ResponseEntity.ok(programService.getAllPrograms());
    }


    @GetMapping("/{id}")
    public ResponseEntity<Program> getProgramById(@PathVariable Long id) {
        return programService.getProgramById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/university/{universityId}")
    public ResponseEntity<List<Program>> getProgramsByUniversity(@PathVariable Long universityId) {
        return ResponseEntity.ok(programService.getProgramsByUniversity(universityId));
    }


    @GetMapping("/degree/{type}")
    public ResponseEntity<List<Program>> getProgramsByDegreeType(@PathVariable ApplicationType type) {
        return ResponseEntity.ok(programService.getProgramsByDegreeType(type));
    }


    @GetMapping("/status/{status}")
    public ResponseEntity<List<Program>> getProgramsByStatus(@PathVariable Status status) {
        return ResponseEntity.ok(programService.getProgramsByStatus(status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Program> updateProgram(@PathVariable Long id, @RequestBody Program programDetails) {
        return programService.getProgramById(id)
                .map(program -> {
                    program.setProgramName(programDetails.getProgramName());
                    program.setDegreeType(programDetails.getDegreeType());
                    program.setDurationYears(programDetails.getDurationYears());
                    program.setTuitionFeeUsd(programDetails.getTuitionFeeUsd());
                    program.setDescription(programDetails.getDescription());
                    program.setStatus(programDetails.getStatus());
                    Program updated = programService.saveProgram(program);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        if (programService.getProgramById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        programService.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }
}
