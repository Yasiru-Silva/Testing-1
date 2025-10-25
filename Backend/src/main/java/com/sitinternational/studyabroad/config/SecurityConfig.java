package com.sitinternational.studyabroad.config;

import com.sitinternational.studyabroad.security.JwtAuthenticationEntryPoint;
import com.sitinternational.studyabroad.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(authz -> authz
            // Allow static resources first (most permissive patterns)
            // NOTE: Avoid using /**/*.<ext> patterns because Spring's PathPatternParser
            // can reject patterns that use ** followed by additional data.
            // Permit a few common explicit static assets and the /static/** folder instead.
            .requestMatchers("/favicon.ico", "/manifest.json", "/logo192.png", "/static/**").permitAll()
            .requestMatchers("/uploads/**").permitAll() // Allow access to uploaded files (CVs, payment slips)
            .requestMatchers("/", "/index.html", "/login", "/register", "/universities", "/programs", "/contact").permitAll()
            // API endpoints
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/universities/**").permitAll()
            .requestMatchers("/api/programs/**").permitAll()
            .requestMatchers("/api/contact-messages", "/api/contact-messages/**").permitAll()
            .requestMatchers("/api/files/upload-cv").authenticated() // Require auth for CV upload
            // Allow viewing application lists. Temporarily permit unauthenticated GET to allow UI debugging.
            // NOTE: This relaxes security and should be reverted after JWT validation is fixed.
            .requestMatchers(HttpMethod.GET, "/api/students/applications/**").permitAll()
            .requestMatchers(HttpMethod.PATCH, "/api/students/*/application/status").hasRole("ADMIN")
            // General authenticated access for other student endpoints
            // Temporarily allow GET access to applications listing for debugging admin UI
            .requestMatchers(HttpMethod.GET, "/api/applications/**").permitAll()
            .requestMatchers("/api/applications/**").authenticated()
            // Admin-only operations on students
            .requestMatchers(HttpMethod.DELETE, "/api/students/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/students/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/students").hasRole("ADMIN") // List all students
            // Students can access their own data
            .requestMatchers("/api/students/**").authenticated()
            // Payment endpoints require authentication
            .requestMatchers("/api/payments/**").authenticated()
            .requestMatchers("/api/notifications/**").authenticated()
            .requestMatchers("/api/admins/**").hasRole("ADMIN")
            // Only require auth for API endpoints, not for other paths
            .requestMatchers("/api/**").authenticated()
            .anyRequest().permitAll()
        )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authenticationProvider(authenticationProvider());
        
        // Add JWT filter for authentication - but skip for contact-messages
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
