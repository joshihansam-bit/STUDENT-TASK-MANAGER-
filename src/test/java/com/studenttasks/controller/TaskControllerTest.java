package com.studenttasks.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studenttasks.dto.DashboardSummaryDto;
import com.studenttasks.dto.TaskRequestDto;
import com.studenttasks.dto.TaskResponseDto;
import com.studenttasks.entity.TaskPriority;
import com.studenttasks.entity.TaskStatus;
import com.studenttasks.entity.TaskType;
import com.studenttasks.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    @Test
    @DisplayName("GET /api/tasks returns 200 OK and list of tasks")
    void testGetAllTasks() throws Exception {
        TaskResponseDto task = new TaskResponseDto();
        task.setId(1L);
        task.setTitle("Algorithms Homework");
        task.setSubject("Computer Science");
        task.setTaskType(TaskType.ASSIGNMENT);
        task.setPriority(TaskPriority.HIGH);
        task.setStatus(TaskStatus.PENDING);
        task.setDueDate(LocalDate.now().plusDays(2));

        Mockito.when(taskService.getAllTasks(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(task));

        mockMvc.perform(get("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Algorithms Homework")))
                .andExpect(jsonPath("$[0].priority", is("HIGH")));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} returns 200 OK with single task")
    void testGetTaskById() throws Exception {
        TaskResponseDto task = new TaskResponseDto();
        task.setId(10L);
        task.setTitle("Physics Lab Report");
        task.setSubject("Physics");
        task.setTaskType(TaskType.LAB_REPORT);
        task.setPriority(TaskPriority.MEDIUM);
        task.setStatus(TaskStatus.IN_PROGRESS);

        Mockito.when(taskService.getTaskById(10L)).thenReturn(task);

        mockMvc.perform(get("/api/tasks/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.title", is("Physics Lab Report")));
    }

    @Test
    @DisplayName("POST /api/tasks creates task successfully and returns 201 Created")
    void testCreateTaskSuccess() throws Exception {
        TaskRequestDto request = new TaskRequestDto();
        request.setTitle("Database Indexing Assignment");
        request.setSubject("Database Systems");
        request.setTaskType(TaskType.ASSIGNMENT);
        request.setPriority(TaskPriority.URGENT);
        request.setDueDate(LocalDate.now().plusDays(3));
        request.setDueTime(LocalTime.of(23, 59));
        request.setEstimatedHours(4.0);

        TaskResponseDto response = new TaskResponseDto();
        response.setId(5L);
        response.setTitle(request.getTitle());
        response.setSubject(request.getSubject());
        response.setTaskType(request.getTaskType());
        response.setPriority(request.getPriority());
        response.setStatus(TaskStatus.PENDING);

        Mockito.when(taskService.createTask(any(TaskRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(5)))
                .andExpect(jsonPath("$.title", is("Database Indexing Assignment")))
                .andExpect(jsonPath("$.priority", is("URGENT")));
    }

    @Test
    @DisplayName("POST /api/tasks validation failure returns 400 Bad Request")
    void testCreateTaskValidationFailure() throws Exception {
        TaskRequestDto invalidRequest = new TaskRequestDto();
        // missing title, subject, taskType, priority, dueDate

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Error")));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/toggle-complete updates status")
    void testToggleTaskComplete() throws Exception {
        TaskResponseDto response = new TaskResponseDto();
        response.setId(1L);
        response.setTitle("Linear Algebra Quiz");
        response.setStatus(TaskStatus.COMPLETED);

        Mockito.when(taskService.toggleTaskComplete(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/tasks/1/toggle-complete")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} returns 200 OK")
    void testDeleteTask() throws Exception {
        Mockito.doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("deleted successfully")));
    }

    @Test
    @DisplayName("GET /api/tasks/dashboard returns 200 OK with dashboard metrics")
    void testGetDashboardSummary() throws Exception {
        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setTotalTasks(12L);
        summary.setPendingTasks(5L);
        summary.setInProgressTasks(2L);
        summary.setCompletedTasks(4L);
        summary.setOverdueTasks(1L);
        summary.setCompletionPercentage(33.3);
        summary.setProductivityScore(82.5);
        summary.setUpcomingDeadlines(Collections.emptyList());

        Mockito.when(taskService.getDashboardSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/tasks/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks", is(12)))
                .andExpect(jsonPath("$.completedTasks", is(4)))
                .andExpect(jsonPath("$.productivityScore", is(82.5)));
    }
}
