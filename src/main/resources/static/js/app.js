/**
 * ==========================================================================
 * MAIN APP CONTROLLER & ROUTER
 * ==========================================================================
 */

let pendingDeleteTaskId = null;

const App = {
    currentPage: 'dashboard',

    async init() {
        this.initTheme();
        this.initCurrentDate();
        this.bindGlobalEvents();

        // Initialize submodules
        await ProfileModule.init();
        await DashboardModule.init();
        await TasksModule.init();
        await CalendarModule.init();

        // Check if database needs seeding or is fresh
        try {
            await TaskApi.seedSampleData();
        } catch (e) {
            console.log('Seed check:', e.message);
        }

        // Set initial page from URL hash or default
        const hash = window.location.hash.replace('#', '');
        if (['dashboard', 'tasks', 'calendar', 'deadlines', 'analytics', 'completed', 'settings'].includes(hash)) {
            this.navigateTo(hash);
        } else {
            this.navigateTo('dashboard');
        }
    },

    bindGlobalEvents() {
        // Navigation clicks
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPage = btn.getAttribute('data-page');
                this.navigateTo(targetPage);
                this.closeMobileSidebar();
            });
        });

        // Quick add in sidebar
        const quickAddBtn = document.getElementById('quickAddBtn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                TasksModule.openAddModal();
                this.closeMobileSidebar();
            });
        }

        // Header Add Task button
        const headerAddTaskBtn = document.getElementById('headerAddTaskBtn');
        if (headerAddTaskBtn) {
            headerAddTaskBtn.addEventListener('click', () => TasksModule.openAddModal());
        }

        // Deadlines Page Add Task
        const deadlinesAddTaskBtn = document.getElementById('deadlinesAddTaskBtn');
        if (deadlinesAddTaskBtn) {
            deadlinesAddTaskBtn.addEventListener('click', () => TasksModule.openAddModal());
        }

        // In-page navigation links (e.g. "View All" buttons)
        document.querySelectorAll('[data-nav-target]').forEach(el => {
            el.addEventListener('click', (e) => {
                const target = el.getAttribute('data-nav-target');
                this.navigateTo(target);
            });
        });

        // Mobile Menu Drawer Toggle
        const menuBtn = document.getElementById('mobileMenuToggle');
        const closeMenuBtn = document.getElementById('mobileCloseSidebar');
        if (menuBtn) menuBtn.addEventListener('click', () => this.openMobileSidebar());
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => this.closeMobileSidebar());

        // Theme Toggle
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

        // Global Search
        const searchInput = document.getElementById('globalSearchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');

        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                if (searchInput.value.trim().length > 0) {
                    if (clearSearchBtn) clearSearchBtn.style.display = 'block';
                    if (this.currentPage !== 'tasks') {
                        this.navigateTo('tasks');
                    }
                } else {
                    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
                }
                TasksModule.loadTasks();
            }, 300));
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                TasksModule.loadTasks();
            });
        }

        // Delete Confirmation Modal Events
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => this.closeDeleteConfirm());
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', () => this.handleConfirmDelete());

        // Light dismiss for dialog modals
        document.querySelectorAll('dialog').forEach(dialog => {
            dialog.addEventListener('click', (e) => {
                const rect = dialog.getBoundingClientRect();
                const isInDialog = (
                    rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX && e.clientX <= rect.left + rect.width
                );
                if (!isInDialog) {
                    dialog.close();
                }
            });
        });
    },

    navigateTo(pageId) {
        this.currentPage = pageId;
        window.location.hash = pageId;

        // Update nav active classes
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update page title
        const titleMap = {
            dashboard: 'Dashboard',
            tasks: 'My Tasks',
            calendar: 'Academic Calendar',
            deadlines: 'Upcoming Deadlines',
            analytics: 'Analytics & Progress',
            completed: 'Completed Archive',
            settings: 'Student Profile & Settings'
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titleMap[pageId] || 'Dashboard';

        // Switch active view
        document.querySelectorAll('.page-view').forEach(view => {
            view.classList.remove('active');
        });

        const activeView = document.getElementById(`view-${pageId}`);
        if (activeView) activeView.classList.add('active');

        // Trigger page-specific loads
        if (pageId === 'dashboard') {
            DashboardModule.loadDashboardData();
        } else if (pageId === 'tasks') {
            TasksModule.loadTasks();
        } else if (pageId === 'calendar') {
            CalendarModule.renderCalendar();
        } else if (pageId === 'deadlines') {
            TasksModule.loadDeadlinesPage();
        } else if (pageId === 'analytics') {
            AnalyticsModule.init();
        } else if (pageId === 'completed') {
            TasksModule.loadCompletedTasks();
        } else if (pageId === 'settings') {
            ProfileModule.loadProfile();
        }
    },

    async refreshAllData() {
        await DashboardModule.loadDashboardData();
        if (this.currentPage === 'tasks') {
            await TasksModule.loadTasks();
        } else if (this.currentPage === 'calendar') {
            await CalendarModule.renderCalendar();
        } else if (this.currentPage === 'deadlines') {
            await TasksModule.loadDeadlinesPage();
        } else if (this.currentPage === 'analytics') {
            await AnalyticsModule.init();
        } else if (this.currentPage === 'completed') {
            await TasksModule.loadCompletedTasks();
        } else if (this.currentPage === 'settings') {
            await ProfileModule.loadProfile();
        }
        await TasksModule.loadSubjects();
    },

    // =========================================================================
    // THEME MANAGEMENT
    // =========================================================================
    initTheme() {
        const savedTheme = localStorage.getItem('studyflow_theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('studyflow_theme', theme);
        const textEl = document.getElementById('themeModeText');
        if (textEl) textEl.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
        
        // Re-render charts if on analytics or dashboard
        if (this.currentPage === 'analytics') {
            AnalyticsModule.init();
        }
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
        this.showToast(`Switched to ${next} theme`, 'info');
    },

    // =========================================================================
    // MOBILE SIDEBAR
    // =========================================================================
    openMobileSidebar() {
        document.getElementById('sidebar')?.classList.add('open');
    },

    closeMobileSidebar() {
        document.getElementById('sidebar')?.classList.remove('open');
    },

    // =========================================================================
    // CURRENT DATE DISPLAY
    // =========================================================================
    initCurrentDate() {
        const dateBadge = document.getElementById('currentDateBadge');
        if (dateBadge) {
            const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
            dateBadge.textContent = new Date().toLocaleDateString('en-US', options);
        }
    },

    // =========================================================================
    // DELETE CONFIRMATION MODAL
    // =========================================================================
    openDeleteConfirm(taskId, taskTitle) {
        pendingDeleteTaskId = taskId;
        const titleEl = document.getElementById('deleteTaskTitle');
        if (titleEl) titleEl.textContent = `"${taskTitle}"`;
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) modal.showModal();
    },

    closeDeleteConfirm() {
        pendingDeleteTaskId = null;
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) modal.close();
    },

    async handleConfirmDelete() {
        if (!pendingDeleteTaskId) return;
        try {
            await TaskApi.deleteTask(pendingDeleteTaskId);
            this.showToast('Task deleted successfully', 'success');
            this.closeDeleteConfirm();
            this.refreshAllData();
        } catch (error) {
            this.showToast('Failed to delete task: ' + error.message, 'error');
        }
    },

    // =========================================================================
    // TOAST NOTIFICATIONS
    // =========================================================================
    showToast(message, type = 'info', duration = 3500) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close-btn" aria-label="Close">&times;</button>
        `;

        toast.querySelector('.toast-close-btn').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // =========================================================================
    // API STATUS
    // =========================================================================
    setApiOnline(isOnline, message = '') {
        const dot = document.getElementById('apiStatusDot');
        const text = document.getElementById('apiStatusText');
        if (dot && text) {
            if (isOnline) {
                dot.className = 'status-dot online';
                text.textContent = 'Connected to Spring Boot';
            } else {
                dot.className = 'status-dot offline';
                text.textContent = 'Backend Offline';
            }
        }
    },

    // =========================================================================
    // UTILITIES
    // =========================================================================
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
