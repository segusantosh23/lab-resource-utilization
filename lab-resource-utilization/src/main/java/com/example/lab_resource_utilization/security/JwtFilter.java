package com.example.lab_resource_utilization.security;

import com.example.lab_resource_utilization.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println("AUTH HEADER: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            try {
                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);

                System.out.println("EMAIL: " + email);
                System.out.println("ROLE: " + role);

                if (email != null &&
                        SecurityContextHolder.getContext().getAuthentication() == null) {

                    // ✅ SAFE ROLE HANDLING (ADD ROLE_ PREFIX FOR SPRING SECURITY)
                    if (role == null || role.isEmpty()) {
                        role = "STUDENT";
                    }
                    
                    // Add ROLE_ prefix if not already present
                    String authorityRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;

                    SimpleGrantedAuthority authority =
                            new SimpleGrantedAuthority(authorityRole);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    Collections.singletonList(authority)
                            );

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    System.out.println("✅ AUTHENTICATED: " + email + " -> " + role);
                }

            } catch (Exception e) {
                System.out.println("❌ JWT ERROR: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}