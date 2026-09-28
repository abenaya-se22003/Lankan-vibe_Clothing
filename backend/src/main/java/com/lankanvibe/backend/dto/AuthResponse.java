package com.lankanvibe.backend.dto;

/**
 * AuthResponse DTO - Returned after successful login or registration
 */
public class AuthResponse {

    private String token;
    private String email;
    private String role;
    private String firstName;
    private String lastName;

    public AuthResponse(String token, String email, String role, String firstName, String lastName) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Getters
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
}
