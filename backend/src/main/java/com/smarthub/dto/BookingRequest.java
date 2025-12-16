package com.smarthub.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {
    
    @NotNull(message = "User ID is required")
    private Integer userId;
    
    @NotNull(message = "Provider ID is required")
    private Integer providerId;
    
    @NotNull(message = "Service type is required")
    private String serviceType;
    
    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;
    
    @NotNull(message = "Booking time is required")
    private LocalTime bookingTime;
}
