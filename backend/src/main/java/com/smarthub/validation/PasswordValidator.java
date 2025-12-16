package com.smarthub.validation;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PasswordValidator {
    
    // Min 8 chars, 1 uppercase, 1 number, 1 special char
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
    
    private final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
    
    public boolean isValid(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        return pattern.matcher(password).matches();
    }
    
    public String getErrorMessage() {
        return "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character";
    }
}
