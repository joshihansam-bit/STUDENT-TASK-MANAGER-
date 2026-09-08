package com.studenttasks.controller;

import com.studenttasks.dto.AnalyticsDto;
import com.studenttasks.dto.DashboardSummaryDto;
import com.studenttasks.dto.TaskRequestDto;
import com.studenttasks.dto.TaskResponseDto;
import com.studenttasks.entity.TaskPriority;
import com.studenttasks.entity.TaskStatus;
import com.studenttasks.entity.TaskType;
import com.studenttasks.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
//@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getAllTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskType taskType,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        List<TaskResponseDto> tasks = taskService.getAllTasks(search, subject, priority, status, taskType, sortBy, sortDirection);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<TaskResponseDto> getTaskById(@PathVariable Long id) {
        TaskResponseDto task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@Valid @RequestBody TaskRequestDto dto) {
        TaskResponseDto created = taskService.createTask(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id:[0-9]+}")
    public ResponseEntity<TaskResponseDto> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDto dto) {
        TaskResponseDto updated = taskService.updateTask(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id:[0-9]+}/status")
    public ResponseEntity<TaskResponseDto> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {
        TaskResponseDto updated = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id:[0-9]+}/toggle-complete")
    public ResponseEntity<TaskResponseDto> toggleTaskComplete(@PathVariable Long id) {
        TaskResponseDto updated = taskService.toggleTaskComplete(id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully with ID: " + id));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        DashboardSummaryDto summary = taskService.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsDto> getAnalytics() {
        AnalyticsDto analytics = taskService.getAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<TaskResponseDto>> getUpcomingDeadlines(
            @RequestParam(defaultValue = "7") int daysAhead) {
        List<TaskResponseDto> upcoming = taskService.getUpcomingDeadlines(daysAhead);
        return ResponseEntity.ok(upcoming);
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<TaskResponseDto>> getCalendarTasks(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        int targetYear = (year != null) ? year : now.getYear();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        List<TaskResponseDto> tasks = taskService.getCalendarTasks(targetYear, targetMonth);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects() {
        List<String> subjects = taskService.getSubjects();
        return ResponseEntity.ok(subjects);
    }

    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> seedSampleData() {
        taskService.seedSampleTasks();
        return ResponseEntity.ok(Map.of("message", "Sample tasks verified and seeded successfully."));
    }
}
