package com.sitinternational.studyabroad.security;

import com.sitinternational.studyabroad.Service.UserDetailsServiceImpl;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // Skip JWT processing for auth endpoints and public endpoints
        String requestURI = request.getRequestURI();
    logger.info("JWT Filter processing request: " + requestURI);
    // Log method and whether an Authorization header is present (don't log the token itself)
    String method = request.getMethod();
    boolean hasAuthHeader = request.getHeader("Authorization") != null && !request.getHeader("Authorization").isEmpty();
    logger.info("Request method: {} | Authorization header present: {}", method, hasAuthHeader);
        
        // Skip JWT processing for static resources
        if (requestURI.endsWith(".ico") || requestURI.endsWith(".png") || 
            requestURI.endsWith(".jpg") || requestURI.endsWith(".jpeg") || 
            requestURI.endsWith(".svg") || requestURI.endsWith(".css") || 
            requestURI.endsWith(".js") || requestURI.endsWith(".json") ||
            requestURI.equals("/") || requestURI.equals("/index.html") ||
            requestURI.startsWith("/static/")) {
            logger.info("Skipping JWT processing for static resource: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        // Skip JWT processing for auth endpoints and public endpoints
        if (requestURI.startsWith("/api/auth/") || 
            requestURI.startsWith("/api/universities/") || 
            requestURI.startsWith("/api/programs/") || 
            requestURI.startsWith("/api/contact-messages") ||
            requestURI.equals("/api/contact-messages")) {
            logger.info("Skipping JWT processing for: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;
        boolean tokenValid = false;

        // JWT Token is in the form "Bearer token". Remove Bearer word and get only the Token
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = tokenProvider.getUsernameFromToken(jwtToken);
                tokenValid = true;
            } catch (IllegalArgumentException e) {
                logger.error("Unable to get JWT Token for request {}: {}", requestURI, e.getMessage());
                tokenValid = false;
            } catch (ExpiredJwtException e) {
                logger.warn("JWT Token has expired for request {}: {}", requestURI, e.getMessage());
                // Don't immediately fail - let Spring Security handle it
                tokenValid = false;
            } catch (SignatureException e) {
                logger.error("JWT signature validation failed for request {}: {}", requestURI, e.getMessage());
                tokenValid = false;
            } catch (MalformedJwtException e) {
                logger.error("Invalid JWT token for request {}: {}", requestURI, e.getMessage());
                tokenValid = false;
            } catch (UnsupportedJwtException e) {
                logger.error("JWT token is unsupported for request {}: {}", requestURI, e.getMessage());
                tokenValid = false;
            }
        } else if (requestTokenHeader != null && !requestTokenHeader.isEmpty()) {
            // Only log warning if there's actually a token header but it's malformed
            logger.warn("JWT Token does not begin with Bearer String: " + requestTokenHeader.substring(0, Math.min(20, requestTokenHeader.length())) + "...");
        }

        // Only process authentication if we have a valid token and username
        if (username != null && tokenValid && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                logger.info("Loaded user details for: " + username + ", authorities: " + userDetails.getAuthorities());

                // if token is valid configure Spring Security to manually set authentication
                if (tokenProvider.validateToken(jwtToken, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Authentication set for user: " + username);
                } else {
                    logger.warn("Token validation failed for user: " + username);
                }
            } catch (Exception e) {
                logger.error("Error loading user details for username: " + username, e);
                // Don't fail the request here - let Spring Security handle authentication
            }
        } else {
            if (username == null) {
                logger.warn("No username extracted from token for request: {} | hasAuthHeader={}", requestURI, hasAuthHeader);
            } else if (!tokenValid) {
                logger.warn("Token is not valid for request: {}", requestURI);
            } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
                logger.info("Authentication already exists for request: {}", requestURI);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
