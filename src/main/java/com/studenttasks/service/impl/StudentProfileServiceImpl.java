package com.studenttasks.service.impl;

import com.studenttasks.dto.StudentProfileDto;
import com.studenttasks.entity.StudentProfile;
import com.studenttasks.repository.StudentProfileRepository;
import com.studenttasks.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository profileRepository;

    @Autowired
    public StudentProfileServiceImpl(StudentProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    public StudentProfileDto getProfile() {
        StudentProfile profile = profileRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    StudentProfile defaultProfile = createDefaultEntity();
                    return profileRepository.save(defaultProfile);
                });
        return mapToDto(profile);
    }

    @Override
    public StudentProfileDto updateProfile(StudentProfileDto dto) {
        StudentProfile profile = profileRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultEntity);

        profile.setFullName(dto.getFullName().trim());
        profile.setEmail(dto.getEmail().trim());
        profile.setInstitution(dto.getInstitution() != null ? dto.getInstitution().trim() : "University of Technology");
        profile.setMajor(dto.getMajor() != null ? dto.getMajor().trim() : "Computer Science");
        profile.setCurrentSemester(dto.getCurrentSemester() != null ? dto.getCurrentSemester().trim() : "Semester 5");
        profile.setTargetGpa(dto.getTargetGpa() != null ? dto.getTargetGpa() : 3.8);
        profile.setDailyStudyGoalHours(dto.getDailyStudyGoalHours() != null ? dto.getDailyStudyGoalHours() : 4.0);
        profile.setAvatarEmoji(dto.getAvatarEmoji() != null ? dto.getAvatarEmoji() : "🎓");
        profile.setThemePreference(dto.getThemePreference() != null ? dto.getThemePreference() : "DARK");
        profile.setEmailNotificationsEnabled(dto.getEmailNotificationsEnabled() != null ? dto.getEmailNotificationsEnabled() : true);

        StudentProfile saved = profileRepository.save(profile);
        return mapToDto(saved);
    }

    @Override
    public void initializeDefaultProfileIfAbsent() {
        if (profileRepository.count() == 0) {
            StudentProfile defaultProfile = createDefaultEntity();
            profileRepository.save(defaultProfile);
        }
    }

    private StudentProfile createDefaultEntity() {
        return new StudentProfile(
                "Hansam Joshi",
                "hansam.student@university.edu",
                "National University of Technology",
                "Computer Science & Engineering",
                "Semester 5",
                3.85,
                4.0,
                "👨‍💻",
                "DARK",
                true
        );
    }

    private StudentProfileDto mapToDto(StudentProfile entity) {
        StudentProfileDto dto = new StudentProfileDto();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setInstitution(entity.getInstitution());
        dto.setMajor(entity.getMajor());
        dto.setCurrentSemester(entity.getCurrentSemester());
        dto.setTargetGpa(entity.getTargetGpa());
        dto.setDailyStudyGoalHours(entity.getDailyStudyGoalHours());
        dto.setAvatarEmoji(entity.getAvatarEmoji());
        dto.setThemePreference(entity.getThemePreference());
        dto.setEmailNotificationsEnabled(entity.getEmailNotificationsEnabled());
        return dto;
    }
}
