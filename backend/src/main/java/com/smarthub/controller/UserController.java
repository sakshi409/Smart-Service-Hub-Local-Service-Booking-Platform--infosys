package com.smarthub.controller;

import com.smarthub.entity.User;
import com.smarthub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
// ✅ REMOVED: @CrossOrigin - using global CORS config
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/profile/{id}")
    public ResponseEntity<User> getProfile(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }
    
    @PutMapping("/profile/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Integer id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateProfile(id, user));
    }
}
