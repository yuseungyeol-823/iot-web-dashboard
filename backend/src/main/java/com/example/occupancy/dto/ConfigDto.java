package com.example.occupancy.dto;

public class ConfigDto {
    private Integer awayTimeout;
    private String sensitivity;

    public ConfigDto() {
    }

    public ConfigDto(Integer awayTimeout, String sensitivity) {
        this.awayTimeout = awayTimeout;
        this.sensitivity = sensitivity;
    }

    public Integer getAwayTimeout() {
        return awayTimeout;
    }

    public void setAwayTimeout(Integer awayTimeout) {
        this.awayTimeout = awayTimeout;
    }

    public String getSensitivity() {
        return sensitivity;
    }

    public void setSensitivity(String sensitivity) {
        this.sensitivity = sensitivity;
    }
}
