package com.studenttasks.service.impl;

import com.studenttasks.dto.AnalyticsDto;
import com.studenttasks.dto.DashboardSummaryDto;
import com.studenttasks.dto.TaskRequestDto;
import com.studenttasks.dto.TaskResponseDto;
import com.studenttasks.entity.Task;
import com.studenttasks.entity.TaskPriority;
import com.studenttasks.entity.TaskStatus;
import com.studenttasks.entity.TaskType;
import com.studenttasks.exception.ResourceNotFoundException;
import com.studenttasks.repository.TaskRepository;
import com.studenttasks.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public TaskResponseDto createTask(TaskRequestDto dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle().trim());
        task.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        task.setSubject(dto.getSubject().trim());
        task.setTaskType(dto.getTaskType());
        task.setPriority(dto.getPriority());
        task.setStatus(dto.getStatus() != null ? dto.getStatus() : TaskStatus.PENDING);
        task.setDueDate(dto.getDueDate());
        task.setDueTime(dto.getDueTime());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setTags(dto.getTags() != null ? dto.getTags().trim() : null);

        if (task.getStatus() == TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        }

        // Auto-check overdue on creation
        checkAndSetOverdue(task);

        Task savedTask = taskRepository.save(task);
        return mapToDto(savedTask);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponseDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        checkAndSetOverdue(task);
        return mapToDto(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getAllTasks(
            String search,
            String subject,
            TaskPriority priority,
            TaskStatus status,
            TaskType taskType,
            String sortBy,
            String sortDirection) {

        String cleanedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanedSubject = (subject != null && !subject.trim().isEmpty() && !subject.equalsIgnoreCase("ALL")) ? subject.trim() : null;

        Sort.Direction direction = (sortDirection != null && sortDirection.equalsIgnoreCase("DESC")) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortField = "dueDate";
        if ("priority".equalsIgnoreCase(sortBy)) {
            sortField = "priority";
        } else if ("title".equalsIgnoreCase(sortBy)) {
            sortField = "title";
        } else if ("createdAt".equalsIgnoreCase(sortBy)) {
            sortField = "createdAt";
        } else if ("status".equalsIgnoreCase(sortBy)) {
            sortField = "status";
        }

        Sort sort = Sort.by(direction, sortField);
        if (!sortField.equals("dueDate")) {
            sort = sort.and(Sort.by(Sort.Direction.ASC, "dueDate"));
        }

        List<Task> tasks = taskRepository.searchTasks(cleanedSearch, cleanedSubject, priority, status, taskType, sort);

        // Update overdue status on read
        return tasks.stream()
                .peek(this::checkAndSetOverdue)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponseDto updateTask(Long id, TaskRequestDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setTitle(dto.getTitle().trim());
        task.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        task.setSubject(dto.getSubject().trim());
        task.setTaskType(dto.getTaskType());
        task.setPriority(dto.getPriority());
        
        TaskStatus previousStatus = task.getStatus();
        TaskStatus newStatus = dto.getStatus() != null ? dto.getStatus() : task.getStatus();
        task.setStatus(newStatus);
        
        if (newStatus == TaskStatus.COMPLETED && previousStatus != TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (newStatus != TaskStatus.COMPLETED) {
            task.setCompletedAt(null);
        }

        task.setDueDate(dto.getDueDate());
        task.setDueTime(dto.getDueTime());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setTags(dto.getTags() != null ? dto.getTags().trim() : null);

        checkAndSetOverdue(task);

        Task updated = taskRepository.save(task);
        return mapToDto(updated);
    }

    @Override
    public TaskResponseDto updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
            checkAndSetOverdue(task);
        }

        Task updated = taskRepository.save(task);
        return mapToDto(updated);
    }

    @Override
    public TaskResponseDto toggleTaskComplete(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (task.getStatus() == TaskStatus.COMPLETED) {
            task.setStatus(TaskStatus.PENDING);
            task.setCompletedAt(null);
            checkAndSetOverdue(task);
        } else {
            task.setStatus(TaskStatus.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
        }

        Task updated = taskRepository.save(task);
        return mapToDto(updated);
    }

    @Override
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        List<Task> allTasks = taskRepository.findAll();
        allTasks.forEach(this::checkAndSetOverdue);

        long total = allTasks.size();
        long completed = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long inProgress = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long overdue = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();
        long pending = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();

        LocalDate today = LocalDate.now();
        LocalDate threeDaysAhead = today.plusDays(3);

        long urgentCount = allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> t.getPriority() == TaskPriority.URGENT ||
                             (t.getDueDate() != null && !t.getDueDate().isAfter(threeDaysAhead)))
                .count();

        double completionPercentage = total > 0 ? Math.round(((double) completed / total) * 100.0 * 10.0) / 10.0 : 0.0;

        // Productivity Score calculation
        double productivityScore = calculateProductivityScore(allTasks);

        // Upcoming deadlines
        List<TaskResponseDto> upcoming = allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .sorted(Comparator.comparing(Task::getDueDate).thenComparing(Task::getPriority, Comparator.reverseOrder()))
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Recent tasks
        List<TaskResponseDto> recent = allTasks.stream()
                .sorted(Comparator.comparing(Task::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Subject breakdown
        Map<String, Long> subjectMap = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getSubject, Collectors.counting()));

        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setTotalTasks(total);
        summary.setPendingTasks(pending);
        summary.setInProgressTasks(inProgress);
        summary.setCompletedTasks(completed);
        summary.setOverdueTasks(overdue);
        summary.setUrgentTasksCount(urgentCount);
        summary.setCompletionPercentage(completionPercentage);
        summary.setProductivityScore(productivityScore);
        summary.setUpcomingDeadlines(upcoming);
        summary.setRecentTasks(recent);
        summary.setSubjectBreakdown(subjectMap);

        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDto getAnalytics() {
        List<Task> allTasks = taskRepository.findAll();
        allTasks.forEach(this::checkAndSetOverdue);

        long total = allTasks.size();
        long completed = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long pending = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long overdue = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();

        double completionRate = total > 0 ? Math.round(((double) completed / total) * 100.0 * 10.0) / 10.0 : 0.0;
        double productivityScore = calculateProductivityScore(allTasks);

        double totalHours = allTasks.stream()
                .mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : 0.0)
                .sum();
        double completedHours = allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : 0.0)
                .sum();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        byStatus.put("COMPLETED", completed);
        byStatus.put("IN_PROGRESS", allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
        byStatus.put("PENDING", allTasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count());
        byStatus.put("OVERDUE", overdue);

        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (TaskPriority p : TaskPriority.values()) {
            byPriority.put(p.name(), allTasks.stream().filter(t -> t.getPriority() == p).count());
        }

        Map<String, Long> bySubject = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getSubject, Collectors.counting()));

        Map<String, Long> byType = new LinkedHashMap<>();
        for (TaskType t : TaskType.values()) {
            long count = allTasks.stream().filter(task -> task.getTaskType() == t).count();
            if (count > 0) {
                byType.put(t.name(), count);
            }
        }

        // Weekly velocity (last 7 days completed tasks)
        List<AnalyticsDto.DailyCompletionDto> weeklyVelocity = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long count = allTasks.stream()
                    .filter(t -> t.getCompletedAt() != null && t.getCompletedAt().toLocalDate().equals(date))
                    .count();
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            String formattedDate = date.format(DateTimeFormatter.ofPattern("MM/dd"));
            weeklyVelocity.add(new AnalyticsDto.DailyCompletionDto(formattedDate, dayName, count));
        }

        AnalyticsDto analytics = new AnalyticsDto();
        analytics.setTotalTasks(total);
        analytics.setCompletedTasks(completed);
        analytics.setPendingTasks(pending);
        analytics.setOverdueTasks(overdue);
        analytics.setCompletionRate(completionRate);
        analytics.setProductivityScore(productivityScore);
        analytics.setTotalEstimatedHours(Math.round(totalHours * 10.0) / 10.0);
        analytics.setCompletedEstimatedHours(Math.round(completedHours * 10.0) / 10.0);
        analytics.setTasksByStatus(byStatus);
        analytics.setTasksByPriority(byPriority);
        analytics.setTasksBySubject(bySubject);
        analytics.setTasksByType(byType);
        analytics.setWeeklyVelocity(weeklyVelocity);

        return analytics;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getUpcomingDeadlines(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate maxDate = today.plusDays(daysAhead);
        List<Task> tasks = taskRepository.findUpcomingUrgentTasks(today, maxDate);
        return tasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getCalendarTasks(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        List<Task> tasks = taskRepository.findTasksBetweenDates(start, end);
        return tasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getSubjects() {
        return taskRepository.findDistinctSubjects();
    }

    @Override
    public void seedSampleTasks() {
        if (taskRepository.count() > 0) {
            return; // Already populated
        }

        LocalDate today = LocalDate.now();

        List<Task> sampleTasks = List.of(
                new Task("Binary Search Trees Assignment", "Implement AVL trees and Red-Black tree rebalancing algorithms in Java.", "Computer Science", TaskType.ASSIGNMENT, TaskPriority.HIGH, TaskStatus.IN_PROGRESS, today.plusDays(1), LocalTime.of(23, 59), 4.0, "Java, DataStructures, Trees"),
                new Task("Calculus III Problem Set 4", "Complete triple integrals and cylindrical coordinates problems 1-15.", "Mathematics", TaskType.ASSIGNMENT, TaskPriority.MEDIUM, TaskStatus.PENDING, today.plusDays(3), LocalTime.of(17, 0), 3.0, "Calculus, Math, Integrals"),
                new Task("Operating Systems Lab 2", "Write multi-threaded process synchronizer using POSIX mutex and semaphores.", "Computer Science", TaskType.LAB_REPORT, TaskPriority.URGENT, TaskStatus.PENDING, today, LocalTime.of(23, 59), 5.0, "C, POSIX, Threads, OS"),
                new Task("Midterm Exam Preparation", "Review Chapters 1-6, practice past exams and algorithmic complexities.", "Algorithms", TaskType.EXAM_PREP, TaskPriority.URGENT, TaskStatus.PENDING, today.plusDays(4), LocalTime.of(9, 0), 8.0, "Exam, BigO, Graphs"),
                new Task("Physics Electromagnetism Lab", "Analyze Hall effect data and plot magnetic field distribution graphs.", "Physics", TaskType.LAB_REPORT, TaskPriority.LOW, TaskStatus.COMPLETED, today.minusDays(2), LocalTime.of(16, 30), 2.5, "Physics, Lab, Electromagnetism"),
                new Task("Software Engineering Team Sprint", "Build sprint backlog, design database schema diagram and REST API contracts.", "Software Engineering", TaskType.PROJECT, TaskPriority.HIGH, TaskStatus.IN_PROGRESS, today.plusDays(6), LocalTime.of(20, 0), 6.0, "Agile, Architecture, Sprint"),
                new Task("Modern European History Essay", "Write 1,500 words on the economic aftermath of the Industrial Revolution.", "History", TaskType.ASSIGNMENT, TaskPriority.MEDIUM, TaskStatus.COMPLETED, today.minusDays(1), LocalTime.of(12, 0), 3.5, "Essay, History, Research"),
                new Task("Database Systems SQL Optimization Quiz", "Study indexing strategies, query execution plans and B+ Trees.", "Database Systems", TaskType.EXAM_PREP, TaskPriority.MEDIUM, TaskStatus.PENDING, today.plusDays(8), LocalTime.of(14, 0), 2.0, "MySQL, Indexing, Quiz")
        );

        for (Task t : sampleTasks) {
            if (t.getStatus() == TaskStatus.COMPLETED) {
                t.setCompletedAt(LocalDateTime.now().minusDays(1));
            }
            taskRepository.save(t);
        }
    }

    private void checkAndSetOverdue(Task task) {
        if (task.getStatus() != TaskStatus.COMPLETED && task.getDueDate() != null) {
            LocalDate today = LocalDate.now();
            LocalTime nowTime = LocalTime.now();
            if (task.getDueDate().isBefore(today) ||
                (task.getDueDate().isEqual(today) && task.getDueTime() != null && task.getDueTime().isBefore(nowTime))) {
                task.setStatus(TaskStatus.OVERDUE);
            }
        }
    }

    private double calculateProductivityScore(List<Task> tasks) {
        if (tasks.isEmpty()) {
            return 85.0; // Baseline good score for empty state
        }
        long total = tasks.size();
        long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long overdue = tasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();

        double completionRatio = (double) completed / total;
        double overdueRatio = (double) overdue / total;
        double inProgressRatio = (double) inProgress / total;

        double score = (completionRatio * 60.0) + (inProgressRatio * 20.0) + 20.0 - (overdueRatio * 30.0);
        score = Math.max(0.0, Math.min(100.0, score));
        return Math.round(score * 10.0) / 10.0;
    }

    private TaskResponseDto mapToDto(Task task) {
        TaskResponseDto dto = new TaskResponseDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setSubject(task.getSubject());
        dto.setTaskType(task.getTaskType());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        dto.setDueDate(task.getDueDate());
        dto.setDueTime(task.getDueTime());
        dto.setEstimatedHours(task.getEstimatedHours());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setTags(task.getTags());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        // Calculated helper fields
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        boolean isOverdue = false;
        long daysDiff = 0;
        if (task.getDueDate() != null) {
            daysDiff = ChronoUnit.DAYS.between(today, task.getDueDate());
            if (task.getStatus() != TaskStatus.COMPLETED) {
                if (task.getDueDate().isBefore(today) ||
                    (task.getDueDate().isEqual(today) && task.getDueTime() != null && task.getDueTime().isBefore(nowTime))) {
                    isOverdue = true;
                }
            }
        }
        dto.setOverdue(isOverdue);
        dto.setDaysRemaining(daysDiff);

        // Format due date string
        if (task.getDueDate() != null) {
            String formatted = task.getDueDate().format(dateFormatter);
            if (task.getDueTime() != null) {
                formatted += " at " + task.getDueTime().format(timeFormatter);
            }
            dto.setFormattedDue(formatted);
        }

        // Urgency Level
        if (isOverdue) {
            dto.setUrgencyLevel("OVERDUE");
        } else if (daysDiff == 0) {
            dto.setUrgencyLevel("TODAY");
        } else if (daysDiff == 1) {
            dto.setUrgencyLevel("TOMORROW");
        } else if (daysDiff <= 7 && daysDiff > 1) {
            dto.setUrgencyLevel("THIS_WEEK");
        } else {
            dto.setUrgencyLevel("LATER");
        }

        return dto;
    }
}
