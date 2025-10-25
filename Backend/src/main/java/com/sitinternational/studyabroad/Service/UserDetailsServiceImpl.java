package com.sitinternational.studyabroad.Service;

import com.sitinternational.studyabroad.entity.Admin;
import com.sitinternational.studyabroad.entity.Student;
import com.sitinternational.studyabroad.Repository.AdminRepository;
import com.sitinternational.studyabroad.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        // First try to find as student
        Student student = studentRepository.findByEmail(username).orElse(null);
        if (student != null) {
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
            
            return new User(student.getEmail(), student.getPasswordHash(), 
                          true, true, true, true, authorities);
        }

        // If not found as student, try to find as admin
        Admin admin = adminRepository.findByEmail(username).orElse(null);
        if (admin != null) {
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + admin.getRole().name()));
            
            return new User(admin.getEmail(), admin.getPassword(), 
                          admin.getIsActive(), true, true, true, authorities);
        }

        throw new UsernameNotFoundException("User not found with email: " + username);
    }
}
