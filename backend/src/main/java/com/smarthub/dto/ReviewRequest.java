package com.smarthub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    
    @NotNull(message = "Booking ID is required")
    private Integer bookingId;
    
    @NotNull(message = "User ID is required")
    private Integer userId;
    
    @NotNull(message = "Provider ID is required")
    private Integer providerId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;
    
    private String comment;
}
