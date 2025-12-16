package com.smarthub.controller;

import com.smarthub.entity.ServiceProvider;
import com.smarthub.entity.Review;
import com.smarthub.service.ServiceProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider")
public class ServiceProviderController {
    
    @Autowired
    private ServiceProviderService serviceProviderService;
    
    @GetMapping("/profile/{id}")
    public ResponseEntity<ServiceProvider> getProfile(@PathVariable Integer id) {
        return ResponseEntity.ok(serviceProviderService.getProfile(id));
    }
    
    @PutMapping("/profile/{id}")
    public ResponseEntity<ServiceProvider> updateProfile(
        @PathVariable Integer id, 
        @RequestBody ServiceProvider provider
    ) {
        return ResponseEntity.ok(serviceProviderService.updateProfile(id, provider));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ServiceProvider>> searchProviders(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String location
    ) {
        return ResponseEntity.ok(serviceProviderService.searchProviders(type, location));
    }
    
    // ✅ Single endpoint for provider reviews (removed duplicate)
    @GetMapping("/reviews/{providerId}")
    public ResponseEntity<List<Review>> getProviderReviews(@PathVariable Integer providerId) {
        return ResponseEntity.ok(serviceProviderService.getProviderReviews(providerId));
    }
}
