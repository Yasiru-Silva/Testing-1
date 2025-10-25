package com.sitinternational.studyabroad.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the project root directory
        String projectRoot = System.getProperty("user.dir");
        
        // Build absolute paths for uploads directories with proper file:/// prefix
        String paymentsPath = Paths.get(projectRoot, "uploads", "payments").toAbsolutePath().toString().replace("\\", "/");
        String cvsPath = Paths.get(projectRoot, "uploads", "cvs").toAbsolutePath().toString().replace("\\", "/");
        
        String paymentsDir = "file:///" + paymentsPath + "/";
        String cvsDir = "file:///" + cvsPath + "/";
        
        // Serve uploaded payment slips
        registry.addResourceHandler("/uploads/payments/**")
                .addResourceLocations(paymentsDir);
        
        // Serve uploaded CV files
        registry.addResourceHandler("/uploads/cvs/**")
                .addResourceLocations(cvsDir);
        
        System.out.println("✅ Static resource handlers configured:");
        System.out.println("   - /uploads/payments/** -> " + paymentsDir);
        System.out.println("   - /uploads/cvs/** -> " + cvsDir);
    }
}

