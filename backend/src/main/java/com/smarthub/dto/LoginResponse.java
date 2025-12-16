package com.smarthub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String message;
    private String role;
    private String redirectUrl;
    private Integer id;
    private String fullName;
    private String email;
    private String mobile;
}
