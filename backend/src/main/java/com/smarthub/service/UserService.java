package com.smarthub.service;

import com.smarthub.entity.User;
import com.smarthub.exception.ResourceNotFoundException;
import com.smarthub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User getProfile(Integer id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    public User updateProfile(Integer id, User updatedUser) {
        User user = getProfile(id);
        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        user.setMobile(updatedUser.getMobile());
        user.setLocation(updatedUser.getLocation());
        return userRepository.save(user);
    }
}
