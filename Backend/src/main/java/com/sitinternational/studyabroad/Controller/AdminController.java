package com.sitinternational.studyabroad.Controller;

import com.sitinternational.studyabroad.entity.Admin;
import com.sitinternational.studyabroad.Service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        if (adminService.existsByEmail(admin.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        Admin saved = adminService.saveAdmin(admin);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long id) {
        return adminService.getAdminById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Admin> getAdminByEmail(@PathVariable String email) {
        return adminService.getAdminByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Admin> updateAdmin(@PathVariable Long id, @RequestBody Admin adminDetails) {
        return adminService.getAdminById(id)
                .map(admin -> {
                    admin.setFirstName(adminDetails.getFirstName());
                    admin.setLastName(adminDetails.getLastName());
                    admin.setEmail(adminDetails.getEmail());
                    admin.setPhone(adminDetails.getPhone());
                    admin.setRole(adminDetails.getRole());
                    admin.setProfileImage(adminDetails.getProfileImage());
                    admin.setIsActive(adminDetails.getIsActive());
                    Admin updated = adminService.saveAdmin(admin);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        if (adminService.getAdminById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
