package com.smarthub.validation;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class MobileNumberValidator {
    
    private static final String MOBILE_PATTERN = "^[0-9]{10}$";
    
    private final Pattern pattern = Pattern.compile(MOBILE_PATTERN);
    
    public boolean isValid(String mobile) {
        if (mobile == null || mobile.isEmpty()) {
            return false;
        }
        return pattern.matcher(mobile).matches();
    }
}
