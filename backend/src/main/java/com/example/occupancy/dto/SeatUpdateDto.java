package com.example.occupancy.dto;

public class SeatUpdateDto {
    private String seatId;
    private String status;
    private Integer remainingTime;

    public SeatUpdateDto() {
    }

    public SeatUpdateDto(String seatId, String status, Integer remainingTime) {
        this.seatId = seatId;
        this.status = status;
        this.remainingTime = remainingTime;
    }

    public String getSeatId() {
        return seatId;
    }

    public void setSeatId(String seatId) {
        this.seatId = seatId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRemainingTime() {
        return remainingTime;
    }

    public void setRemainingTime(Integer remainingTime) {
        this.remainingTime = remainingTime;
    }

    @Override
    public String toString() {
        return "SeatUpdateDto{" +
                "seatId='" + seatId + '\'' +
                ", status='" + status + '\'' +
                ", remainingTime=" + remainingTime +
                '}';
    }
}
