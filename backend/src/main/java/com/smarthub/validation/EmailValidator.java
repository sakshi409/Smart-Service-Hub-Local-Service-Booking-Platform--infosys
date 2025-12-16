package com.smarthub.validation;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class EmailValidator {
    
    private static final String EMAIL_PATTERN = 
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    
    private final Pattern pattern = Pattern.compile(EMAIL_PATTERN);
    
    public boolean isValid(String email) {
        if (email == null || email.isEmpty()) {
            return true; // Email is optional
        }
        return pattern.matcher(email).matches();
    }
}
