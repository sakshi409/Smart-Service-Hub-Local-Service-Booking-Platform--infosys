package com.smarthub.service;

import com.smarthub.dto.LoginRequest;
import com.smarthub.dto.LoginResponse;
import com.smarthub.dto.SignupRequest;
import com.smarthub.entity.*;
import com.smarthub.exception.ResourceNotFoundException;
import com.smarthub.repository.*;
import com.smarthub.validation.EmailValidator;
import com.smarthub.validation.MobileNumberValidator;
import com.smarthub.validation.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;

@Service
public class AuthService {
    
    @Autowired
    private HomeRepository homeRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ServiceProviderRepository serviceProviderRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private EmailValidator emailValidator;
    
    @Autowired
    private PasswordValidator passwordValidator;
    
    @Autowired
    private MobileNumberValidator mobileNumberValidator;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Transactional
    public LoginResponse register(SignupRequest request) {
        try {
            // Validate mobile
            if (!mobileNumberValidator.isValid(request.getMobile())) {
                throw new IllegalArgumentException("Invalid mobile number. Must be 10 digits.");
            }
            
            // Validate password
            if (!passwordValidator.isValid(request.getPassword())) {
                throw new IllegalArgumentException(passwordValidator.getErrorMessage());
            }
            
            // Validate email if provided
            if (request.getEmail() != null && !request.getEmail().isEmpty() 
                && !emailValidator.isValid(request.getEmail())) {
                throw new IllegalArgumentException("Invalid email format");
            }
            
            // Check if mobile already exists
            if (homeRepository.existsByMobile(request.getMobile())) {
                throw new IllegalArgumentException("Mobile number already registered");
            }
            
            // Check if email already exists
            if (request.getEmail() != null && !request.getEmail().isEmpty() 
                && homeRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already registered");
            }
            
            // Create Home entry
            Home home = new Home();
            home.setFullName(request.getFullName());
            home.setMobile(request.getMobile());
            home.setEmail(request.getEmail());
            home.setPassword(request.getPassword());
            home.setRole(Home.Role.valueOf(request.getRole().toUpperCase()));
            
            // Save and flush to ensure we get the ID immediately
            home = homeRepository.saveAndFlush(home);
            
            System.out.println("Home saved with ID: " + home.getId());
            
            // Create role-specific entry
            Integer entityId = null;
            String redirectUrl = "";
            
            switch (home.getRole()) {
                case USER:
                    User user = new User();
                    user.setHomeId(home.getId());
                    user.setFullName(request.getFullName());
                    user.setEmail(request.getEmail());
                    user.setMobile(request.getMobile());
                    user.setLocation(request.getLocation() != null ? request.getLocation() : "");
                    user = userRepository.saveAndFlush(user);
                    entityId = user.getUserId();
                    redirectUrl = "/user-dashboard";
                    System.out.println("User saved with ID: " + user.getUserId());
                    break;
                    
                case SERVICE_PROVIDER:
                    ServiceProvider provider = new ServiceProvider();
                    provider.setHomeId(home.getId());
                    provider.setFullName(request.getFullName());
                    provider.setEmail(request.getEmail());
                    provider.setMobile(request.getMobile());
                    provider.setServiceType(request.getServiceType() != null ? request.getServiceType() : "");
                    provider.setExperience(request.getExperience() != null ? request.getExperience() : 0);
                    
                    // Handle price conversion safely
                    BigDecimal price = BigDecimal.ZERO;
                    if (request.getPrice() != null && !request.getPrice().isEmpty()) {
                        try {
                            price = new BigDecimal(request.getPrice());
                        } catch (NumberFormatException e) {
                            price = BigDecimal.ZERO;
                        }
                    }
                    provider.setPrice(price);
                    
                    provider.setAvailability(request.getAvailability() != null ? request.getAvailability() : "");
                    provider.setLocation(request.getLocation() != null ? request.getLocation() : "");
                    provider = serviceProviderRepository.saveAndFlush(provider);
                    entityId = provider.getProviderId();
                    redirectUrl = "/provider-dashboard";
                    System.out.println("Provider saved with ID: " + provider.getProviderId());
                    break;
                    
                case ADMIN:
                    Admin admin = new Admin();
                    admin.setHomeId(home.getId());
                    admin.setFullName(request.getFullName());
                    admin.setEmail(request.getEmail());
                    admin.setMobile(request.getMobile());
                    admin = adminRepository.saveAndFlush(admin);
                    entityId = admin.getAdminId();
                    redirectUrl = "/admin-dashboard";
                    System.out.println("Admin saved with ID: " + admin.getAdminId());
                    break;
            }
            
            // Force flush to database
            entityManager.flush();
            
            return new LoginResponse(
                "Registration successful",
                home.getRole().toString(),
                redirectUrl,
                entityId,
                home.getFullName(),
                home.getEmail(),
                home.getMobile()
            );
            
        } catch (Exception e) {
            System.err.println("Error during registration: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            // Validate mobile
            if (!mobileNumberValidator.isValid(request.getMobile())) {
                throw new IllegalArgumentException("Invalid mobile number");
            }
            
            // Find user in home table
            Home.Role role = Home.Role.valueOf(request.getRole().toUpperCase());
            Home home = homeRepository.findByMobileAndPasswordAndRole(
                request.getMobile(), 
                request.getPassword(), 
                role
            ).orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));
            
            // Get role-specific data
            Integer entityId = null;
            String redirectUrl = "";
            
            switch (home.getRole()) {
                case USER:
                    User user = userRepository.findByHomeId(home.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    entityId = user.getUserId();
                    redirectUrl = "/user-dashboard";
                    break;
                    
                case SERVICE_PROVIDER:
                    ServiceProvider provider = serviceProviderRepository.findByHomeId(home.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
                    entityId = provider.getProviderId();
                    redirectUrl = "/provider-dashboard";
                    break;
                    
                case ADMIN:
                    Admin admin = adminRepository.findByHomeId(home.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
                    entityId = admin.getAdminId();
                    redirectUrl = "/admin-dashboard";
                    break;
            }
            
            return new LoginResponse(
                "Login successful",
                home.getRole().toString(),
                redirectUrl,
                entityId,
                home.getFullName(),
                home.getEmail(),
                home.getMobile()
            );
            
        } catch (Exception e) {
            System.err.println("Error during login: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
