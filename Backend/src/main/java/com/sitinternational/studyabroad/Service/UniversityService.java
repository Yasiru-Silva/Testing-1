package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.University;
import com.sitinternational.studyabroad.Repository.UniversityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UniversityService {

    @Autowired
    private UniversityRepository universityRepository;

    public University saveUniversity(University university) {
        return universityRepository.save(university);
    }

    public List<University> getAllUniversities() {
        return universityRepository.findAll();
    }

    public Optional<University> getUniversityById(Long universityId) {
        return universityRepository.findById(universityId);
    }

    public Optional<University> getUniversityByName(String name) {
        return universityRepository.findByNameIgnoreCase(name);
    }

    public void deleteUniversity(Long universityId) {
        universityRepository.deleteById(universityId);
    }

    public boolean existsByName(String name) {
        return universityRepository.existsByNameIgnoreCase(name);
    }
}
