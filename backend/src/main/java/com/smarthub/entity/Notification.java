package com.smarthub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer notificationId;
    
    @Column(name = "receiver_id", nullable = false)
    private Integer receiverId;
    
    @Column(name = "receiver_type", nullable = false, length = 20)
    private String receiverType; // "USER" or "PROVIDER"
    
    @Column(name = "message", nullable = false, length = 500)
    private String message;
    
    @Column(name = "type", length = 50)
    private String type; // "BOOKING_REQUEST", "BOOKING_ACCEPTED", "BOOKING_REJECTED"
    
    @Column(name = "status", nullable = false, length = 20)
    private String status = "UNREAD"; // "UNREAD" or "READ"
    
    @Column(name = "related_booking_id")
    private Integer relatedBookingId;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
