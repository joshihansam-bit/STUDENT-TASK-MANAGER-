/**
 * ==========================================================================
 * STUDENT PROFILE & SETTINGS MODULE
 * ==========================================================================
 */

let currentProfile = {
    fullName: 'Hansam Joshi',
    email: 'hansam.student@university.edu',
    institution: 'National University of Technology',
    major: 'Computer Science & Engineering',
    currentSemester: 'Semester 5',
    targetGpa: 3.85,
    dailyStudyGoalHours: 4.0,
    avatarEmoji: '👨‍💻',
    themePreference: 'DARK',
    emailNotificationsEnabled: true
};

const ProfileModule = {
    async init() {
        this.bindEvents();
        await this.loadProfile();
    },

    bindEvents() {
        // Profile form submit
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleSaveProfile(e));
        }

        // Avatar selector choices
        document.querySelectorAll('.avatar-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.avatar-choice-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                const emoji = btn.getAttribute('data-emoji');
                document.getElementById('profileAvatarInput').value = emoji;
                document.getElementById('profileAvatarPreview').textContent = emoji;
            });
        });

        // Quick profile trigger in header user pill
        const userPill = document.querySelector('.user-pill');
        if (userPill) {
            userPill.style.cursor = 'pointer';
            userPill.addEventListener('click', () => {
                App.navigateTo('settings');
            });
        }
    },

    async loadProfile() {
        try {
            const data = await TaskApi.getProfile();
            currentProfile = data;
            this.populateForm(data);
            this.updateHeaderAndWelcome(data);
        } catch (error) {
            console.warn('Could not load profile, using defaults:', error);
            this.updateHeaderAndWelcome(currentProfile);
        }
    },

    populateForm(data) {
        if (!data) return;
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val != null ? val : '';
        };

        setVal('profileFullName', data.fullName);
        setVal('profileEmail', data.email);
        setVal('profileInstitution', data.institution);
        setVal('profileMajor', data.major);
        setVal('profileSemester', data.currentSemester);
        setVal('profileTargetGpa', data.targetGpa);
        setVal('profileStudyGoal', data.dailyStudyGoalHours);
        setVal('profileAvatarInput', data.avatarEmoji || '👨‍💻');
        setVal('profileThemeSelect', data.themePreference || 'DARK');

        const notifCheck = document.getElementById('profileEmailNotifs');
        if (notifCheck) notifCheck.checked = data.emailNotificationsEnabled !== false;

        const avatarPrev = document.getElementById('profileAvatarPreview');
        if (avatarPrev) avatarPrev.textContent = data.avatarEmoji || '👨‍💻';

        // Select avatar in list
        document.querySelectorAll('.avatar-choice-btn').forEach(btn => {
            if (btn.getAttribute('data-emoji') === (data.avatarEmoji || '👨‍💻')) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        // Summary cards in settings view
        const dispName = document.getElementById('settingsDisplayName');
        const dispMajor = document.getElementById('settingsDisplayMajor');
        const dispInst = document.getElementById('settingsDisplayInst');
        const dispGoal = document.getElementById('settingsDisplayGoal');
        const dispGpa = document.getElementById('settingsDisplayGpa');

        if (dispName) dispName.textContent = data.fullName;
        if (dispMajor) dispMajor.textContent = `${data.major} (${data.currentSemester || 'Semester 5'})`;
        if (dispInst) dispInst.textContent = data.institution;
        if (dispGoal) dispGoal.textContent = `${data.dailyStudyGoalHours || 4} hrs/day`;
        if (dispGpa) dispGpa.textContent = data.targetGpa ? `${data.targetGpa} GPA` : '3.85 GPA';
    },

    updateHeaderAndWelcome(data) {
        if (!data) return;
        
        // Update user pill in top header
        const userNameEl = document.querySelector('.user-name');
        const userAvatarEl = document.querySelector('.user-avatar');
        if (userNameEl) userNameEl.textContent = data.fullName;
        if (userAvatarEl) userAvatarEl.textContent = data.avatarEmoji || '👨‍💻';

        // Update dashboard welcome headline
        const welcomeHeading = document.querySelector('.welcome-heading');
        if (welcomeHeading) {
            const firstName = data.fullName.split(' ')[0] || 'Scholar';
            welcomeHeading.innerHTML = `Welcome back, ${App.escapeHtml(firstName)}! ${data.avatarEmoji || '🚀'}`;
        }
    },

    async handleSaveProfile(e) {
        e.preventDefault();
        const errAlert = document.getElementById('profileFormError');
        if (errAlert) errAlert.style.display = 'none';

        const fullName = document.getElementById('profileFullName').value.trim();
        const email = document.getElementById('profileEmail').value.trim();
        const institution = document.getElementById('profileInstitution').value.trim();
        const major = document.getElementById('profileMajor').value.trim();
        const currentSemester = document.getElementById('profileSemester').value.trim();
        const targetGpa = parseFloat(document.getElementById('profileTargetGpa').value) || 3.8;
        const dailyStudyGoalHours = parseFloat(document.getElementById('profileStudyGoal').value) || 4.0;
        const avatarEmoji = document.getElementById('profileAvatarInput').value || '👨‍💻';
        const themePreference = document.getElementById('profileThemeSelect').value || 'DARK';
        const emailNotificationsEnabled = document.getElementById('profileEmailNotifs')?.checked ?? true;

        if (!fullName || !email) {
            if (errAlert) {
                errAlert.textContent = 'Full Name and Email are required.';
                errAlert.style.display = 'block';
            }
            return;
        }

        const payload = {
            fullName,
            email,
            institution,
            major,
            currentSemester,
            targetGpa,
            dailyStudyGoalHours,
            avatarEmoji,
            themePreference,
            emailNotificationsEnabled
        };

        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) saveBtn.disabled = true;

        try {
            const updated = await TaskApi.updateProfile(payload);
            currentProfile = updated;
            this.populateForm(updated);
            this.updateHeaderAndWelcome(updated);
            
            // Sync theme if changed
            if (themePreference === 'LIGHT') {
                App.setTheme('light');
            } else if (themePreference === 'DARK') {
                App.setTheme('dark');
            }

            App.showToast('Student profile and settings saved successfully!', 'success');
        } catch (error) {
            if (errAlert) {
                errAlert.textContent = error.message;
                errAlert.style.display = 'block';
            }
            App.showToast('Failed to save profile: ' + error.message, 'error');
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    }
};

window.ProfileModule = ProfileModule;
