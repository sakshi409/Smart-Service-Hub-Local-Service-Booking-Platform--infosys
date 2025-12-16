package com.smarthub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_provider")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceProvider {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "provider_id")
    private Integer providerId;
    
    @Column(name = "home_id", nullable = false)
    private Integer homeId;
    
    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "mobile", length = 15, nullable = false)
    private String mobile;
    
    @Column(name = "service_type", length = 100)
    private String serviceType;
    
    @Column(name = "experience")
    private Integer experience;
    
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "availability", length = 100)
    private String availability;
    
    @Column(name = "location", length = 255)
    private String location;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
