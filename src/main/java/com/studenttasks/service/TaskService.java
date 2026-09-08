package com.studenttasks.service;

import com.studenttasks.dto.AnalyticsDto;
import com.studenttasks.dto.DashboardSummaryDto;
import com.studenttasks.dto.TaskRequestDto;
import com.studenttasks.dto.TaskResponseDto;
import com.studenttasks.entity.TaskPriority;
import com.studenttasks.entity.TaskStatus;
import com.studenttasks.entity.TaskType;

import java.util.List;

public interface TaskService {

    TaskResponseDto createTask(TaskRequestDto dto);

    TaskResponseDto getTaskById(Long id);

    List<TaskResponseDto> getAllTasks(
            String search,
            String subject,
            TaskPriority priority,
            TaskStatus status,
            TaskType taskType,
            String sortBy,
            String sortDirection);

    TaskResponseDto updateTask(Long id, TaskRequestDto dto);

    TaskResponseDto updateTaskStatus(Long id, TaskStatus status);

    TaskResponseDto toggleTaskComplete(Long id);

    void deleteTask(Long id);

    DashboardSummaryDto getDashboardSummary();

    AnalyticsDto getAnalytics();

    List<TaskResponseDto> getUpcomingDeadlines(int daysAhead);

    List<TaskResponseDto> getCalendarTasks(int year, int month);

    List<String> getSubjects();

    void seedSampleTasks();
}
