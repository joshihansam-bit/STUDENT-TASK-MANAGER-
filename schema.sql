-- =======================================================
-- Student Task Manager - Database Schema & Seed Data
-- =======================================================

CREATE DATABASE IF NOT EXISTS student_task_db;
USE student_task_db;

-- Drop tables if exist
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS student_profile;

-- Create student_profile table
CREATE TABLE student_profile (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    institution VARCHAR(150),
    major VARCHAR(100),
    current_semester VARCHAR(50),
    target_gpa DOUBLE,
    daily_study_goal_hours DOUBLE,
    avatar_emoji VARCHAR(20),
    theme_preference VARCHAR(20),
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default student profile
INSERT INTO student_profile (full_name, email, institution, major, current_semester, target_gpa, daily_study_goal_hours, avatar_emoji, theme_preference, email_notifications_enabled, created_at, updated_at)
VALUES 
('Hansam Joshi', 'hansam.student@university.edu', 'National University of Technology', 'Computer Science & Engineering', 'Semester 5', 3.85, 4.0, '👨‍💻', 'DARK', TRUE, NOW(), NOW());

-- Create tasks table
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    subject VARCHAR(100) NOT NULL,
    task_type VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    due_date DATE NOT NULL,
    due_time TIME,
    estimated_hours DOUBLE,
    completed_at DATETIME,
    tags VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_task_status (status),
    INDEX idx_task_due_date (due_date),
    INDEX idx_task_priority (priority),
    INDEX idx_task_subject (subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Seed Data for Coursework Tasks
INSERT INTO tasks (title, description, subject, task_type, priority, status, due_date, due_time, estimated_hours, completed_at, tags, created_at, updated_at)
VALUES 
('Binary Search Trees Assignment', 'Implement AVL trees and Red-Black tree rebalancing algorithms in Java.', 'Computer Science', 'ASSIGNMENT', 'HIGH', 'IN_PROGRESS', CURDATE() + INTERVAL 1 DAY, '23:59:00', 4.0, NULL, 'Java, DataStructures, Trees', NOW(), NOW()),
('Calculus III Problem Set 4', 'Complete triple integrals and cylindrical coordinates problems 1-15.', 'Mathematics', 'ASSIGNMENT', 'MEDIUM', 'PENDING', CURDATE() + INTERVAL 3 DAY, '17:00:00', 3.0, NULL, 'Calculus, Math, Integrals', NOW(), NOW()),
('Operating Systems Lab 2', 'Write multi-threaded process synchronizer using POSIX mutex and semaphores.', 'Computer Science', 'LAB_REPORT', 'URGENT', 'PENDING', CURDATE(), '23:59:00', 5.0, NULL, 'C, POSIX, Threads, OS', NOW(), NOW()),
('Midterm Exam Preparation', 'Review Chapters 1-6, practice past exams and algorithmic complexities.', 'Algorithms', 'EXAM_PREP', 'URGENT', 'PENDING', CURDATE() + INTERVAL 4 DAY, '09:00:00', 8.0, NULL, 'Exam, BigO, Graphs', NOW(), NOW()),
('Physics Electromagnetism Lab', 'Analyze Hall effect data and plot magnetic field distribution graphs.', 'Physics', 'LAB_REPORT', 'LOW', 'COMPLETED', CURDATE() - INTERVAL 2 DAY, '16:30:00', 2.5, NOW() - INTERVAL 2 DAY, 'Physics, Lab, Electromagnetism', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY),
('Software Engineering Team Sprint', 'Build sprint backlog, design database schema diagram and REST API contracts.', 'Software Engineering', 'PROJECT', 'HIGH', 'IN_PROGRESS', CURDATE() + INTERVAL 6 DAY, '20:00:00', 6.0, NULL, 'Agile, Architecture, Sprint', NOW(), NOW()),
('Modern European History Essay', 'Write 1,500 words on the economic aftermath of the Industrial Revolution.', 'History', 'ASSIGNMENT', 'MEDIUM', 'COMPLETED', CURDATE() - INTERVAL 1 DAY, '12:00:00', 3.5, NOW() - INTERVAL 1 DAY, 'Essay, History, Research', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY),
('Database Systems SQL Optimization Quiz', 'Study indexing strategies, query execution plans and B+ Trees.', 'Database Systems', 'EXAM_PREP', 'MEDIUM', 'PENDING', CURDATE() + INTERVAL 8 DAY, '14:00:00', 2.0, NULL, 'MySQL, Indexing, Quiz', NOW(), NOW());
