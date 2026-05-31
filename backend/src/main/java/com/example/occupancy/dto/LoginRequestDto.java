package com.example.occupancy.dto;

public class LoginRequestDto {
    private String adminId;
    private String password;

    public LoginRequestDto() {
    }

    public LoginRequestDto(String adminId, String password) {
        this.adminId = adminId;
        this.password = password;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
