package com.smarthub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "booking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Integer bookingId;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "provider_id", nullable = false)
    private Integer providerId;
    
    @Column(name = "service_type", length = 100, nullable = false)
    private String serviceType;
    
    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;
    
    @Column(name = "booking_time", nullable = false)
    private LocalTime bookingTime;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    // Booking status enum
    public enum BookingStatus {
        PENDING,
        ACCEPTED,
        CONFIRMED,
        REJECTED,
        COMPLETED,
        PAID,
        CANCELLED
    }
}
