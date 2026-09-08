package com.studenttasks.controller;

import com.studenttasks.dto.StudentProfileDto;
import com.studenttasks.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class StudentProfileController {

    private final StudentProfileService profileService;

    @Autowired
    public StudentProfileController(StudentProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<StudentProfileDto> getProfile() {
        StudentProfileDto profile = profileService.getProfile();
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<StudentProfileDto> updateProfile(@Valid @RequestBody StudentProfileDto dto) {
        StudentProfileDto updated = profileService.updateProfile(dto);
        return ResponseEntity.ok(updated);
    }
}
