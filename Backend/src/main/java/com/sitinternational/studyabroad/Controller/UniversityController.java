package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.entity.University;
import com.sitinternational.studyabroad.Service.UniversityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/universities")
public class UniversityController {

    @Autowired
    private UniversityService universityService;

    @PostMapping
    public ResponseEntity<University> createUniversity(@RequestBody University university) {
        if (universityService.existsByName(university.getName())) {
            return ResponseEntity.badRequest().build();
        }
        University saved = universityService.saveUniversity(university);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<University>> getAllUniversities() {
        return ResponseEntity.ok(universityService.getAllUniversities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<University> getUniversityById(@PathVariable Long id) {
        return universityService.getUniversityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<University> updateUniversity(@PathVariable Long id, @RequestBody University updatedDetails) {
        return universityService.getUniversityById(id)
                .map(university -> {
                    university.setName(updatedDetails.getName());
                    university.setLocation(updatedDetails.getLocation());
                    university.setDescription(updatedDetails.getDescription());
                    university.setWebsite(updatedDetails.getWebsite());
                    University updated = universityService.saveUniversity(university);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUniversity(@PathVariable Long id) {
        if (universityService.getUniversityById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        universityService.deleteUniversity(id);
        return ResponseEntity.noContent().build();
    }
}