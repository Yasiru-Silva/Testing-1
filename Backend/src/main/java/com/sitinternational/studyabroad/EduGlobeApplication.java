package com.sitinternational.studyabroad;

import com.sitinternational.studyabroad.config.DatabaseConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.sql.DataSource;

@SpringBootApplication
public class EduGlobeApplication implements CommandLineRunner {

	@Autowired
	private DataSource dataSource;

	@Autowired
	private DatabaseConfig databaseConfig;

	public static void main(String[] args) {
		SpringApplication.run(EduGlobeApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		System.out.println("\n🚀 SIT International Study Abroad Portal Starting...");
		System.out.println("📊 Testing Database Connection...");
		databaseConfig.testConnection(dataSource);
		System.out.println("✅ Application Started Successfully!");
		System.out.println("🌐 API Documentation: http://localhost:8082");
		System.out.println("📝 Available Endpoints:");
		System.out.println("   - POST /api/auth/login");
		System.out.println("   - POST /api/auth/register/student");
		System.out.println("   - GET /api/universities");
		System.out.println("   - GET /api/programs");
		System.out.println("   - POST /api/contact-messages");
		System.out.println("\n");
	}
}
