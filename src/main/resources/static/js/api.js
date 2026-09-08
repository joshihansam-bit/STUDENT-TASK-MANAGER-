/**
 * ==========================================================================
 * REST API CLIENT FOR STUDENT TASK MANAGER & PROFILE
 * ==========================================================================
 */

const API_ROOT = (window.location.port === '8080' || window.location.port === '')
    ? '/api'
    : 'http://localhost:8080/api';

const TaskApi = {
    /**
     * Get all tasks with optional filters and sorting
     */
    async getAllTasks(params = {}) {
        const query = new URLSearchParams();
        if (params.search) query.append('search', params.search);
        if (params.subject) query.append('subject', params.subject);
        if (params.priority) query.append('priority', params.priority);
        if (params.status) query.append('status', params.status);
        if (params.taskType) query.append('taskType', params.taskType);
        if (params.sortBy) query.append('sortBy', params.sortBy);
        if (params.sortDirection) query.append('sortDirection', params.sortDirection);

        const url = `${API_ROOT}/tasks?${query.toString()}`;
        const response = await fetch(url);
        return this.handleResponse(response);
    },

    /**
     * Get a single task by ID
     */
    async getTaskById(id) {
        const response = await fetch(`${API_ROOT}/tasks/${id}`);
        return this.handleResponse(response);
    },

    /**
     * Create a new task
     */
    async createTask(taskData) {
        const response = await fetch(`${API_ROOT}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return this.handleResponse(response);
    },

    /**
     * Update an existing task
     */
    async updateTask(id, taskData) {
        const response = await fetch(`${API_ROOT}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return this.handleResponse(response);
    },

    /**
     * Update task status
     */
    async updateStatus(id, status) {
        const response = await fetch(`${API_ROOT}/tasks/${id}/status?status=${encodeURIComponent(status)}`, {
            method: 'PATCH'
        });
        return this.handleResponse(response);
    },

    /**
     * Toggle task complete / pending
     */
    async toggleComplete(id) {
        const response = await fetch(`${API_ROOT}/tasks/${id}/toggle-complete`, {
            method: 'PATCH'
        });
        return this.handleResponse(response);
    },

    /**
     * Delete task by ID
     */
    async deleteTask(id) {
        const response = await fetch(`${API_ROOT}/tasks/${id}`, {
            method: 'DELETE'
        });
        return this.handleResponse(response);
    },

    /**
     * Get dashboard KPI summary
     */
    async getDashboardSummary() {
        const response = await fetch(`${API_ROOT}/tasks/dashboard`);
        return this.handleResponse(response);
    },

    /**
     * Get analytics and chart datasets
     */
    async getAnalytics() {
        const response = await fetch(`${API_ROOT}/tasks/analytics`);
        return this.handleResponse(response);
    },

    /**
     * Get upcoming deadlines
     */
    async getUpcoming(daysAhead = 30) {
        const response = await fetch(`${API_ROOT}/tasks/upcoming?daysAhead=${daysAhead}`);
        return this.handleResponse(response);
    },

    /**
     * Get tasks for calendar by month and year
     */
    async getCalendarTasks(year, month) {
        const query = new URLSearchParams();
        if (year) query.append('year', year);
        if (month) query.append('month', month);
        const response = await fetch(`${API_ROOT}/tasks/calendar?${query.toString()}`);
        return this.handleResponse(response);
    },

    /**
     * Get list of unique subjects
     */
    async getSubjects() {
        const response = await fetch(`${API_ROOT}/tasks/subjects`);
        return this.handleResponse(response);
    },

    /**
     * Seed sample tasks if DB is fresh
     */
    async seedSampleData() {
        const response = await fetch(`${API_ROOT}/tasks/seed`, { method: 'POST' });
        return this.handleResponse(response);
    },

    /**
     * Student Profile APIs
     */
    async getProfile() {
        const response = await fetch(`${API_ROOT}/profile`);
        return this.handleResponse(response);
    },

    async updateProfile(profileData) {
        const response = await fetch(`${API_ROOT}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        return this.handleResponse(response);
    },

    /**
     * Standard response and error extractor
     */
    async handleResponse(response) {
        if (!response.ok) {
            let errorMsg = `Server error (${response.status})`;
            try {
                const errJson = await response.json();
                if (errJson.validationErrors) {
                    const firstError = Object.values(errJson.validationErrors)[0];
                    errorMsg = firstError || errJson.message || errorMsg;
                } else if (errJson.message) {
                    errorMsg = errJson.message;
                }
            } catch (e) {
                // Non-JSON error
            }
            throw new Error(errorMsg);
        }
        return await response.json();
    }
};

window.TaskApi = TaskApi;
