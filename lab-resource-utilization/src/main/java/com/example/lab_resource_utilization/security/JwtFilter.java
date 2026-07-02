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

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            try {
                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);
                
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String authorityName = (role != null && !role.isEmpty()) ? 
                            (role.startsWith("ROLE_") ? role : "ROLE_" + role) : "ROLE_STUDENT";
                    
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(authorityName);
                    
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(email, null, Collections.singletonList(authority));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Authenticated user: " + email + " with role: " + authorityName);
                }
            } catch (Exception e) {
                System.out.println("Invalid token: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}