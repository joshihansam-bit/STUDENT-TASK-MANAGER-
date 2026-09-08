package com.studenttasks.repository;

import com.studenttasks.entity.Task;
import com.studenttasks.entity.TaskPriority;
import com.studenttasks.entity.TaskStatus;
import com.studenttasks.entity.TaskType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    List<Task> findByStatus(TaskStatus status);

    long countByStatus(TaskStatus status);

    long countByStatusNot(TaskStatus status);

    @Query("SELECT DISTINCT t.subject FROM Task t ORDER BY t.subject ASC")
    List<String> findDistinctSubjects();

    @Query("SELECT t FROM Task t WHERE " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.tags) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:subject IS NULL OR t.subject = :subject) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:taskType IS NULL OR t.taskType = :taskType)")
    List<Task> searchTasks(
            @Param("search") String search,
            @Param("subject") String subject,
            @Param("priority") TaskPriority priority,
            @Param("status") TaskStatus status,
            @Param("taskType") TaskType taskType,
            Sort sort);

    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :startDate AND :endDate ORDER BY t.dueDate ASC, t.dueTime ASC")
    List<Task> findTasksBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Task t WHERE t.status <> com.studenttasks.entity.TaskStatus.COMPLETED AND (t.dueDate < :today OR (t.dueDate = :today AND t.dueTime IS NOT NULL AND t.dueTime < CURRENT_TIME))")
    List<Task> findOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.status <> com.studenttasks.entity.TaskStatus.COMPLETED AND t.dueDate BETWEEN :today AND :thresholdDate ORDER BY t.dueDate ASC, t.priority DESC, t.dueTime ASC")
    List<Task> findUpcomingUrgentTasks(@Param("today") LocalDate today, @Param("thresholdDate") LocalDate thresholdDate);

    @Query("SELECT t.subject, COUNT(t) FROM Task t GROUP BY t.subject")
    List<Object[]> countTasksBySubject();

    @Query("SELECT t.status, COUNT(t) FROM Task t GROUP BY t.status")
    List<Object[]> countTasksByStatusGroup();

    @Query("SELECT t.priority, COUNT(t) FROM Task t GROUP BY t.priority")
    List<Object[]> countTasksByPriorityGroup();
}
