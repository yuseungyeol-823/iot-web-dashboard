package com.example.occupancy.dto;

public class ConfigDto {
    private Integer awayTimeout;
    private String sensitivity;
    private String streamUrl;

    public ConfigDto() {
    }

    public ConfigDto(Integer awayTimeout, String sensitivity, String streamUrl) {
        this.awayTimeout = awayTimeout;
        this.sensitivity = sensitivity;
        this.streamUrl = streamUrl;
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

    public String getStreamUrl() {
        return streamUrl;
    }

    public void setStreamUrl(String streamUrl) {
        this.streamUrl = streamUrl;
    }
}
