package com.studenttasks.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDto {

    private double completionRate;
    private double productivityScore;
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long overdueTasks;
    private double totalEstimatedHours;
    private double completedEstimatedHours;

    private Map<String, Long> tasksByStatus;
    private Map<String, Long> tasksByPriority;
    private Map<String, Long> tasksBySubject;
    private Map<String, Long> tasksByType;

    private List<DailyCompletionDto> weeklyVelocity;

    public AnalyticsDto() {
    }

    public static class DailyCompletionDto {
        private String date;
        private String dayOfWeek;
        private long completedCount;

        public DailyCompletionDto() {
        }

        public DailyCompletionDto(String date, String dayOfWeek, long completedCount) {
            this.date = date;
            this.dayOfWeek = dayOfWeek;
            this.completedCount = completedCount;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getDayOfWeek() {
            return dayOfWeek;
        }

        public void setDayOfWeek(String dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
        }

        public long getCompletedCount() {
            return completedCount;
        }

        public void setCompletedCount(long completedCount) {
            this.completedCount = completedCount;
        }
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public double getProductivityScore() {
        return productivityScore;
    }

    public void setProductivityScore(double productivityScore) {
        this.productivityScore = productivityScore;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getOverdueTasks() {
        return overdueTasks;
    }

    public void setOverdueTasks(long overdueTasks) {
        this.overdueTasks = overdueTasks;
    }

    public double getTotalEstimatedHours() {
        return totalEstimatedHours;
    }

    public void setTotalEstimatedHours(double totalEstimatedHours) {
        this.totalEstimatedHours = totalEstimatedHours;
    }

    public double getCompletedEstimatedHours() {
        return completedEstimatedHours;
    }

    public void setCompletedEstimatedHours(double completedEstimatedHours) {
        this.completedEstimatedHours = completedEstimatedHours;
    }

    public Map<String, Long> getTasksByStatus() {
        return tasksByStatus;
    }

    public void setTasksByStatus(Map<String, Long> tasksByStatus) {
        this.tasksByStatus = tasksByStatus;
    }

    public Map<String, Long> getTasksByPriority() {
        return tasksByPriority;
    }

    public void setTasksByPriority(Map<String, Long> tasksByPriority) {
        this.tasksByPriority = tasksByPriority;
    }

    public Map<String, Long> getTasksBySubject() {
        return tasksBySubject;
    }

    public void setTasksBySubject(Map<String, Long> tasksBySubject) {
        this.tasksBySubject = tasksBySubject;
    }

    public Map<String, Long> getTasksByType() {
        return tasksByType;
    }

    public void setTasksByType(Map<String, Long> tasksByType) {
        this.tasksByType = tasksByType;
    }

    public List<DailyCompletionDto> getWeeklyVelocity() {
        return weeklyVelocity;
    }

    public void setWeeklyVelocity(List<DailyCompletionDto> weeklyVelocity) {
        this.weeklyVelocity = weeklyVelocity;
    }
}
