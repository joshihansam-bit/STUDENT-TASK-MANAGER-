package com.studenttasks.dto;

import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {

    private long totalTasks;
    private long pendingTasks;
    private long inProgressTasks;
    private long completedTasks;
    private long overdueTasks;
    private long urgentTasksCount;
    private double completionPercentage;
    private double productivityScore;
    private List<TaskResponseDto> upcomingDeadlines;
    private List<TaskResponseDto> recentTasks;
    private Map<String, Long> subjectBreakdown;

    public DashboardSummaryDto() {
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getInProgressTasks() {
        return inProgressTasks;
    }

    public void setInProgressTasks(long inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getOverdueTasks() {
        return overdueTasks;
    }

    public void setOverdueTasks(long overdueTasks) {
        this.overdueTasks = overdueTasks;
    }

    public long getUrgentTasksCount() {
        return urgentTasksCount;
    }

    public void setUrgentTasksCount(long urgentTasksCount) {
        this.urgentTasksCount = urgentTasksCount;
    }

    public double getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public double getProductivityScore() {
        return productivityScore;
    }

    public void setProductivityScore(double productivityScore) {
        this.productivityScore = productivityScore;
    }

    public List<TaskResponseDto> getUpcomingDeadlines() {
        return upcomingDeadlines;
    }

    public void setUpcomingDeadlines(List<TaskResponseDto> upcomingDeadlines) {
        this.upcomingDeadlines = upcomingDeadlines;
    }

    public List<TaskResponseDto> getRecentTasks() {
        return recentTasks;
    }

    public void setRecentTasks(List<TaskResponseDto> recentTasks) {
        this.recentTasks = recentTasks;
    }

    public Map<String, Long> getSubjectBreakdown() {
        return subjectBreakdown;
    }

    public void setSubjectBreakdown(Map<String, Long> subjectBreakdown) {
        this.subjectBreakdown = subjectBreakdown;
    }
}
