package com.studenttasks.service;

import com.studenttasks.dto.DashboardSummaryDto;
import com.studenttasks.dto.TaskRequestDto;
import com.studenttasks.dto.TaskResponseDto;
import com.studenttasks.entity.Task;
import com.studenttasks.entity.TaskPriority;
import com.studenttasks.entity.TaskStatus;
import com.studenttasks.entity.TaskType;
import com.studenttasks.exception.ResourceNotFoundException;
import com.studenttasks.repository.TaskRepository;
import com.studenttasks.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new Task();
        sampleTask.setId(1L);
        sampleTask.setTitle("Discrete Math Homework");
        sampleTask.setSubject("Mathematics");
        sampleTask.setTaskType(TaskType.ASSIGNMENT);
        sampleTask.setPriority(TaskPriority.HIGH);
        sampleTask.setStatus(TaskStatus.PENDING);
        sampleTask.setDueDate(LocalDate.now().plusDays(2));
        sampleTask.setDueTime(LocalTime.of(18, 0));
        sampleTask.setEstimatedHours(3.0);
    }

    @Test
    @DisplayName("createTask saves entity and returns correct DTO")
    void testCreateTask() {
        TaskRequestDto dto = new TaskRequestDto();
        dto.setTitle("Discrete Math Homework");
        dto.setSubject("Mathematics");
        dto.setTaskType(TaskType.ASSIGNMENT);
        dto.setPriority(TaskPriority.HIGH);
        dto.setDueDate(LocalDate.now().plusDays(2));
        dto.setDueTime(LocalTime.of(18, 0));
        dto.setEstimatedHours(3.0);

        Mockito.when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        TaskResponseDto created = taskService.createTask(dto);

        assertNotNull(created);
        assertEquals(1L, created.getId());
        assertEquals("Discrete Math Homework", created.getTitle());
        assertEquals("Mathematics", created.getSubject());
        assertFalse(created.isOverdue());
    }

    @Test
    @DisplayName("getTaskById throws ResourceNotFoundException when ID does not exist")
    void testGetTaskByIdNotFound() {
        Mockito.when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(999L));
    }

    @Test
    @DisplayName("toggleTaskComplete toggles PENDING to COMPLETED and sets completedAt")
    void testToggleTaskComplete() {
        Mockito.when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        Mockito.when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponseDto result = taskService.toggleTaskComplete(1L);

        assertEquals(TaskStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedAt());
    }

    @Test
    @DisplayName("getDashboardSummary calculates accurate totals and metrics")
    void testGetDashboardSummary() {
        Task t1 = new Task();
        t1.setId(1L);
        t1.setTitle("Task 1");
        t1.setSubject("CS");
        t1.setStatus(TaskStatus.COMPLETED);
        t1.setPriority(TaskPriority.LOW);
        t1.setDueDate(LocalDate.now().plusDays(1));

        Task t2 = new Task();
        t2.setId(2L);
        t2.setTitle("Task 2");
        t2.setSubject("CS");
        t2.setStatus(TaskStatus.PENDING);
        t2.setPriority(TaskPriority.URGENT);
        t2.setDueDate(LocalDate.now().minusDays(1)); // overdue

        Mockito.when(taskRepository.findAll()).thenReturn(List.of(t1, t2));

        DashboardSummaryDto summary = taskService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(2L, summary.getTotalTasks());
        assertEquals(1L, summary.getCompletedTasks());
        assertEquals(1L, summary.getOverdueTasks());
        assertEquals(50.0, summary.getCompletionPercentage());
    }
}
