package com.smarthub.controller;

import com.smarthub.dto.LoginRequest;
import com.smarthub.dto.LoginResponse;
import com.smarthub.dto.SignupRequest;
import com.smarthub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// ✅ REMOVE @CrossOrigin annotation - using global config instead
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Backend is running");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody SignupRequest request) {
        System.out.println("========================================");
        System.out.println("REGISTER ENDPOINT HIT!");
        System.out.println("Received signup request for: " + request.getMobile());
        System.out.println("Full Name: " + request.getFullName());
        System.out.println("Role: " + request.getRole());
        System.out.println("========================================");
        
        try {
            LoginResponse response = authService.register(request);
            System.out.println("Registration successful for: " + request.getMobile());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Server error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("========================================");
        System.out.println("LOGIN ENDPOINT HIT!");
        System.out.println("Received login request for: " + request.getMobile());
        System.out.println("========================================");
        
        try {
            LoginResponse response = authService.login(request);
            System.out.println("Login successful for: " + request.getMobile());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
