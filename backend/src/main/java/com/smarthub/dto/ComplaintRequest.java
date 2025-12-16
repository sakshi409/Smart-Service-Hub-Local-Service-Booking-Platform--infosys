package com.smarthub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComplaintRequest {
    
    @NotNull(message = "User ID is required")
    private Integer userId;
    
    private Integer providerId;
    
    @NotBlank(message = "Message is required")
    private String message;
}
