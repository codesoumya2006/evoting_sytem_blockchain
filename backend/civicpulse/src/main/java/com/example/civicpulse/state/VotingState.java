package com.example.civicpulse.state;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class VotingState {

    @Id
    private Long id;

    private String status;

    private LocalDateTime endTime;

    private int durationMinutes;

    public VotingState() {}

    public VotingState(Long id, String status, LocalDateTime endTime, int durationMinutes) {
        this.id = id;
        this.status = status;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
}
