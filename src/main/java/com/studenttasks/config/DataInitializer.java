package com.studenttasks.config;

import com.studenttasks.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final TaskService taskService;
    private final com.studenttasks.service.StudentProfileService profileService;

    @Autowired
    public DataInitializer(TaskService taskService, com.studenttasks.service.StudentProfileService profileService) {
        this.taskService = taskService;
        this.profileService = profileService;
    }

    @Override
    public void run(String... args) {
        try {
            logger.info("Initializing student profile and sample coursework tasks...");
            profileService.initializeDefaultProfileIfAbsent();
            taskService.seedSampleTasks();
            logger.info("Database initialization completed successfully.");
        } catch (Exception ex) {
            logger.warn("Could not complete data initialization: {}", ex.getMessage());
        }
    }
}
