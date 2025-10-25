package com.sitinternational.studyabroad.config;

import com.sitinternational.studyabroad.entity.Admin;
import com.sitinternational.studyabroad.entity.University;
import com.sitinternational.studyabroad.entity.Program;
import com.sitinternational.studyabroad.enums.Role;
import com.sitinternational.studyabroad.enums.ApplicationType;
import com.sitinternational.studyabroad.enums.Status;
import com.sitinternational.studyabroad.Repository.AdminRepository;
import com.sitinternational.studyabroad.Repository.UniversityRepository;
import com.sitinternational.studyabroad.Repository.ProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UniversityRepository universityRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeAdminUsers();
        initializeUniversitiesAndPrograms();
    }

    private void initializeAdminUsers() {
        List<Admin> adminUsers = Arrays.asList(
            // Super Admin
            Admin.builder()
                .firstName("System")
                .lastName("Administrator")
                .email("admin@sitinternational.com")
                .phone("+94 11 234 5678")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .isActive(true)
                .build(),

            // Admin Manager
            Admin.builder()
                .firstName("Sarah")
                .lastName("Johnson")
                .email("sarah.johnson@sitinternational.com")
                .phone("+94 11 234 5679")
                .password(passwordEncoder.encode("manager123"))
                .role(Role.MANAGER)
                .isActive(true)
                .build(),

            // Admin Staff 1
            Admin.builder()
                .firstName("Michael")
                .lastName("Chen")
                .email("michael.chen@sitinternational.com")
                .phone("+94 11 234 5680")
                .password(passwordEncoder.encode("staff123"))
                .role(Role.STAFF)
                .isActive(true)
                .build(),

            // Admin Staff 2
            Admin.builder()
                .firstName("Priya")
                .lastName("Patel")
                .email("priya.patel@sitinternational.com")
                .phone("+94 11 234 5681")
                .password(passwordEncoder.encode("staff123"))
                .role(Role.STAFF)
                .isActive(true)
                .build(),

            // Admin Staff 3
            Admin.builder()
                .firstName("David")
                .lastName("Rodriguez")
                .email("david.rodriguez@sitinternational.com")
                .phone("+94 11 234 5682")
                .password(passwordEncoder.encode("staff123"))
                .role(Role.STAFF)
                .isActive(true)
                .build()
        );

        for (Admin admin : adminUsers) {
            if (!adminRepository.existsByEmail(admin.getEmail())) {
                adminRepository.save(admin);
                System.out.println("✅ Created admin user: " + admin.getEmail() + " (" + admin.getRole() + ")");
            } else {
                System.out.println("ℹ️  Admin user already exists: " + admin.getEmail());
            }
        }
    }


    private void initializeUniversitiesAndPrograms() {
        System.out.println("🚀 Initializing universities and programs...");

        // 1. Chuvash State Pedagogical University
        University chuvashPedagogical = createUniversityIfNotExists(
            "Chuvash State Pedagogical University",
            "Cheboksary, Russia",
            "A leading pedagogical university offering comprehensive programs in education, technology, and medicine.",
            "https://www.chgpu.edu.ru",
            "1930",
            "15,000+",
            4.5
        );

        createProgramsForUniversity(chuvashPedagogical, Arrays.asList(
            "Informatics and Computer Engineering",
            "Applied Mathematics",
            "Physics and Information Technology",
            "Radio Electronics and Automation",
            "Civil Engineering",
            "Mechanical Engineering",
            "Energy and Electrical Engineering",
            "Management and Social Technologies",
            "History and Geography",
            "Medicine (MBBS)",
            "Chemistry and Pharmacy",
            "Foreign Languages",
            "Journalism",
            "Economics",
            "Law",
            "Arts"
        ));

        // 2. Samara National Research University
        University samaraUniversity = createUniversityIfNotExists(
            "Samara National Research University",
            "Samara, Russia",
            "A prestigious national research university known for aerospace engineering and technological innovation.",
            "https://www.ssau.ru",
            "1918",
            "20,000+",
            4.7
        );

        createProgramsForUniversity(samaraUniversity, Arrays.asList(
            "Aerospace Engineering",
            "Engine and Power Plant Engineering",
            "IT and Cybernetics",
            "Economics and Management",
            "Natural Sciences",
            "Social Sciences and Humanities",
            "Law"
        ));

        // 3. Yaroslavl State Technical University (YSTU)
        University yaroslavlTech = createUniversityIfNotExists(
            "Yaroslavl State Technical University (YSTU)",
            "Yaroslavl, Russia",
            "A leading technical university offering comprehensive engineering and technology programs.",
            "https://www.ystu.ru",
            "1944",
            "12,000+",
            4.3
        );

        createProgramsForUniversity(yaroslavlTech, Arrays.asList(
            "Architecture",
            "Design and technological support of machine building productions",
            "Material science and technology of materials",
            "Ground transport and technological complexes",
            "Ground vehicle and technological equipment",
            "Standardization and metrology",
            "Technological machines and equipment",
            "Construction",
            "Fundamental and applied chemistry",
            "Chemical technology",
            "Chemistry",
            "Info communication technologies and communication systems",
            "Information systems and technologies",
            "Software engineering",
            "Control in technical systems",
            "Management",
            "Vocational training (by industry)",
            "Quality control",
            "Economy"
        ));

        // 4. Chuvash State Agrarian University
        University chuvashAgrarian = createUniversityIfNotExists(
            "Chuvash State Agrarian University",
            "Cheboksary, Russia",
            "Specializes in agricultural sciences, biotechnology, and veterinary medicine.",
            "https://www.chgau.ru",
            "1931",
            "8,000+",
            4.2
        );

        createProgramsForUniversity(chuvashAgrarian, Arrays.asList(
            "Biotechnology and Agronomy",
            "Engineering",
            "Economics",
            "Veterinary Medicine and Animal Science"
        ));

        // 5. Lobachevsky State University of Nizhny Novgorod (UNN)
        University lobachevskyUniversity = createUniversityIfNotExists(
            "Lobachevsky State University of Nizhny Novgorod (UNN)",
            "Nizhny Novgorod, Russia",
            "A comprehensive university offering programs in sciences, humanities, and professional studies.",
            "https://www.unn.ru",
            "1916",
            "40,000+",
            4.6
        );

        createProgramsForUniversity(lobachevskyUniversity, Arrays.asList(
            "Biology and Biomedicine",
            "Information Technology, Mathematics and Mechanics",
            "International Relations and World History",
            "Economics and Entrepreneurship",
            "Public Administration",
            "Radio physics",
            "Social Sciences",
            "Physics",
            "Physical Education and Sports",
            "Philology and Journalism",
            "Chemistry",
            "Law",
            "Doctoral Studies",
            "General and Applied Physics",
            "Professional Development",
            "Rehabilitation and Human Health",
            "Arts and Design",
            "Clinical Medicine",
            "Advanced Engineering"
        ));

        // 6. Kazan Innovative University
        University kazanInnovative = createUniversityIfNotExists(
            "Kazan Innovative University",
            "Kazan, Russia",
            "Offers modern programs in economics, technology, and social sciences with a focus on innovation.",
            "https://www.ieml.ru",
            "1996",
            "18,000+",
            4.4
        );

        createProgramsForUniversity(kazanInnovative, Arrays.asList(
            "Economics",
            "Economic Theory",
            "Finance and Credit",
            "Financial Management",
            "Accounting and Auditing",
            "Management and Engineering",
            "Management",
            "Information Technology and Security",
            "Higher Mathematics",
            "Logistics",
            "Industrial Management",
            "Technosphere and Environmental Safety",
            "Law",
            "Psychology and Pedagogy",
            "Psychology",
            "Russian Language and Linguistics",
            "Physical Education",
            "Service, Tourism and Food Service Management",
            "Hotel and Tourism Business",
            "Marketing and Economics",
            "Foreign Languages and Translation",
            "Design"
        ));

        System.out.println("✅ Universities and programs initialization completed!");
    }

    private University createUniversityIfNotExists(String name, String location, String description, String website, 
                                                   String established, String students, Double rating) {
        if (!universityRepository.existsByNameIgnoreCase(name)) {
            University university = University.builder()
                .name(name)
                .location(location)
                .description(description)
                .website(website)
                .established(established)
                .students(students)
                .rating(rating)
                .build();

            university = universityRepository.save(university);
            System.out.println("✅ Created university: " + name);
            return university;
        } else {
            University existing = universityRepository.findByNameIgnoreCase(name).orElse(null);
            if (existing != null) {
                // Update existing university with new fields
                existing.setLocation(location);
                existing.setDescription(description);
                existing.setWebsite(website);
                existing.setEstablished(established);
                existing.setStudents(students);
                existing.setRating(rating);
                existing = universityRepository.save(existing);
                System.out.println("✅ Updated university: " + name);
            }
            return existing;
        }
    }

    private void createProgramsForUniversity(University university, List<String> programNames) {
        for (String programName : programNames) {
            if (!programRepository.existsByProgramNameAndUniversity(programName, university)) {
                Program program = Program.builder()
                    .university(university)
                    .programName(programName)
                    .degreeType(ApplicationType.UNDERGRADUATE) // Default to undergraduate
                    .durationYears(4) // Default to 4 years
                    .description("Comprehensive program in " + programName + " at " + university.getName())
                    .tuitionFeeUsd(new BigDecimal("2500.00")) // Default tuition fee
                    .status(Status.ACTIVE)
                    .build();

                programRepository.save(program);
                System.out.println("  ✅ Created program: " + programName);
            } else {
                System.out.println("  ℹ️  Program already exists: " + programName);
            }
        }
    }
}






