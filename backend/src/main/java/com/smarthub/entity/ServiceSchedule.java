package com.smarthub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "service_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Integer scheduleId;
    
    @Column(name = "provider_id", nullable = false)
    private Integer providerId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", length = 10)
    private DayOfWeek dayOfWeek;
    
    @Column(name = "start_time")
    private LocalTime startTime;
    
    @Column(name = "end_time")
    private LocalTime endTime;
    
    public enum DayOfWeek {
        MON, TUE, WED, THU, FRI, SAT, SUN
    }
}
