package com.smarthub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SignupRequest {
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Mobile number is required")
    private String mobile;
    
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotNull(message = "Role is required")
    private String role;
    
    // Service Provider specific fields
    private String serviceType;
    private Integer experience;
    private String price;
    private String availability;
    private String location;
}
