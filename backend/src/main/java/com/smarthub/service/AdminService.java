package com.smarthub.service;

import com.smarthub.entity.User;
import com.smarthub.entity.ServiceProvider;
import com.smarthub.entity.Booking;
import com.smarthub.entity.Complaint;
import com.smarthub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ServiceProviderRepository serviceProviderRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<ServiceProvider> getAllProviders() {
        return serviceProviderRepository.findAll();
    }
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }
    
    public Complaint updateComplaint(Integer complaintId, String status, String response) {
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus(Complaint.ComplaintStatus.valueOf(status.toUpperCase()));
        complaint.setResponse(response);
        return complaintRepository.save(complaint);
    }
}
