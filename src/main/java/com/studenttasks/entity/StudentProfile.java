package com.studenttasks.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_profile")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 150)
    private String institution;

    @Column(length = 100)
    private String major;

    @Column(length = 50)
    private String currentSemester;

    private Double targetGpa;

    private Double dailyStudyGoalHours;

    @Column(length = 20)
    private String avatarEmoji;

    @Column(length = 20)
    private String themePreference;

    private Boolean emailNotificationsEnabled;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public StudentProfile() {
    }

    public StudentProfile(String fullName, String email, String institution, String major,
                          String currentSemester, Double targetGpa, Double dailyStudyGoalHours,
                          String avatarEmoji, String themePreference, Boolean emailNotificationsEnabled) {
        this.fullName = fullName;
        this.email = email;
        this.institution = institution;
        this.major = major;
        this.currentSemester = currentSemester;
        this.targetGpa = targetGpa;
        this.dailyStudyGoalHours = dailyStudyGoalHours;
        this.avatarEmoji = avatarEmoji;
        this.themePreference = themePreference;
        this.emailNotificationsEnabled = emailNotificationsEnabled;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.avatarEmoji == null) this.avatarEmoji = "🎓";
        if (this.themePreference == null) this.themePreference = "DARK";
        if (this.emailNotificationsEnabled == null) this.emailNotificationsEnabled = true;
        if (this.dailyStudyGoalHours == null) this.dailyStudyGoalHours = 4.0;
        if (this.targetGpa == null) this.targetGpa = 3.8;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(String currentSemester) {
        this.currentSemester = currentSemester;
    }

    public Double getTargetGpa() {
        return targetGpa;
    }

    public void setTargetGpa(Double targetGpa) {
        this.targetGpa = targetGpa;
    }

    public Double getDailyStudyGoalHours() {
        return dailyStudyGoalHours;
    }

    public void setDailyStudyGoalHours(Double dailyStudyGoalHours) {
        this.dailyStudyGoalHours = dailyStudyGoalHours;
    }

    public String getAvatarEmoji() {
        return avatarEmoji;
    }

    public void setAvatarEmoji(String avatarEmoji) {
        this.avatarEmoji = avatarEmoji;
    }

    public String getThemePreference() {
        return themePreference;
    }

    public void setThemePreference(String themePreference) {
        this.themePreference = themePreference;
    }

    public Boolean getEmailNotificationsEnabled() {
        return emailNotificationsEnabled;
    }

    public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) {
        this.emailNotificationsEnabled = emailNotificationsEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
