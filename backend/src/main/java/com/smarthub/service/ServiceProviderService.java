package com.smarthub.service;

import com.smarthub.entity.Review;
import com.smarthub.entity.ServiceProvider;
import com.smarthub.exception.ResourceNotFoundException;
import com.smarthub.repository.ReviewRepository;
import com.smarthub.repository.ServiceProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServiceProviderService {
    
    @Autowired
    private ServiceProviderRepository serviceProviderRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    public ServiceProvider getProfile(Integer id) {
        return serviceProviderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));
    }
    
    @Transactional
    public ServiceProvider updateProfile(Integer id, ServiceProvider updatedProvider) {
        ServiceProvider provider = getProfile(id);
        
        // Update only non-null fields
        if (updatedProvider.getFullName() != null) {
            provider.setFullName(updatedProvider.getFullName());
        }
        if (updatedProvider.getEmail() != null) {
            provider.setEmail(updatedProvider.getEmail());
        }
        if (updatedProvider.getMobile() != null) {
            provider.setMobile(updatedProvider.getMobile());
        }
        if (updatedProvider.getServiceType() != null) {
            provider.setServiceType(updatedProvider.getServiceType());
        }
        if (updatedProvider.getExperience() != null) {
            provider.setExperience(updatedProvider.getExperience());
        }
        if (updatedProvider.getPrice() != null) {
            provider.setPrice(updatedProvider.getPrice());
        }
        if (updatedProvider.getAvailability() != null) {
            provider.setAvailability(updatedProvider.getAvailability());
        }
        if (updatedProvider.getLocation() != null) {
            provider.setLocation(updatedProvider.getLocation());
        }
        
        return serviceProviderRepository.save(provider);
    }
    
    public List<ServiceProvider> searchProviders(String type, String location) {
        if (type != null && location != null) {
            return serviceProviderRepository
                .findByServiceTypeContainingIgnoreCaseAndLocationContainingIgnoreCase(type, location);
        } else if (type != null) {
            return serviceProviderRepository.findByServiceTypeContainingIgnoreCase(type);
        } else if (location != null) {
            return serviceProviderRepository.findByLocationContainingIgnoreCase(location);
        }
        return serviceProviderRepository.findAll();
    }
    
    // ✅ FIXED: Implement getProviderReviews method
    public List<Review> getProviderReviews(Integer providerId) {
        return reviewRepository.findByProviderId(providerId);
    }
}
