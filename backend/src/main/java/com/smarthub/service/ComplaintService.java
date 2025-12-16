package com.smarthub.service;

import com.smarthub.dto.ComplaintRequest;
import com.smarthub.entity.Complaint;
import com.smarthub.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ComplaintService {
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    public Complaint createComplaint(ComplaintRequest request) {
        Complaint complaint = new Complaint();
        complaint.setUserId(request.getUserId());
        complaint.setProviderId(request.getProviderId());
        complaint.setMessage(request.getMessage());
        complaint.setStatus(Complaint.ComplaintStatus.OPEN);
        return complaintRepository.save(complaint);
    }
}
