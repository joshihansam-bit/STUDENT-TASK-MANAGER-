package com.studenttasks.service;

import com.studenttasks.dto.StudentProfileDto;

public interface StudentProfileService {

    StudentProfileDto getProfile();

    StudentProfileDto updateProfile(StudentProfileDto dto);

    void initializeDefaultProfileIfAbsent();
}
