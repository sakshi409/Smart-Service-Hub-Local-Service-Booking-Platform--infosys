package com.smarthub.controller;

import com.smarthub.entity.User;
import com.smarthub.entity.ServiceProvider;
import com.smarthub.entity.Booking;
import com.smarthub.entity.Complaint;
import com.smarthub.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    
    @GetMapping("/providers")
    public ResponseEntity<List<ServiceProvider>> getAllProviders() {
        return ResponseEntity.ok(adminService.getAllProviders());
    }
    
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }
    
    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(adminService.getAllComplaints());
    }
    
    @PutMapping("/complaints/{id}")
    public ResponseEntity<Complaint> updateComplaint(
        @PathVariable Integer id,
        @RequestBody Map<String, String> request
    ) {
        return ResponseEntity.ok(adminService.updateComplaint(
            id, 
            request.get("status"), 
            request.get("response")
        ));
    }
}
