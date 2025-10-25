package com.sitinternational.studyabroad.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    // Test database connection on startup
    public void testConnection(DataSource dataSource) {
        try (Connection connection = dataSource.getConnection()) {
            System.out.println("✅ Database Connection Successful!");
            System.out.println("📍 Database URL: " + databaseUrl);
            System.out.println("👤 Username: " + username);
            System.out.println("🔗 Connection Status: " + (!connection.isClosed() ? "OPEN" : "CLOSED"));
        } catch (SQLException e) {
            System.err.println("❌ Database Connection Failed!");
            System.err.println("Error: " + e.getMessage());
        }
    }
}
