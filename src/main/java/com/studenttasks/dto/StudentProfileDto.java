package com.studenttasks.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StudentProfileDto {

    private Long id;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @Size(max = 150, message = "Institution name cannot exceed 150 characters")
    private String institution;

    @Size(max = 100, message = "Major name cannot exceed 100 characters")
    private String major;

    @Size(max = 50, message = "Semester info cannot exceed 50 characters")
    private String currentSemester;

    private Double targetGpa;

    private Double dailyStudyGoalHours;

    private String avatarEmoji;

    private String themePreference;

    private Boolean emailNotificationsEnabled;

    public StudentProfileDto() {
    }

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
}
