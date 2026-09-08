/**
 * ==========================================================================
 * DASHBOARD MODULE WITH FOCUS STUDY TIMER & KPIS
 * ==========================================================================
 */

let dashSubjectChartInstance = null;
let focusTimerInterval = null;
let focusTimeRemaining = 25 * 60; // 25 minutes default in seconds
let focusTotalDuration = 25 * 60;
let isFocusTimerRunning = false;
let completedFocusSessions = 0;

const DashboardModule = {
    async init() {
        this.bindEvents();
        this.initFocusTimer();
        await this.loadDashboardData();
    },

    bindEvents() {
        const quickAddForm = document.getElementById('quickAddForm');
        if (quickAddForm) {
            quickAddForm.addEventListener('submit', (e) => this.handleQuickAdd(e));
        }

        // Set default due date to tomorrow on quick add
        const qaDueDate = document.getElementById('qaDueDate');
        if (qaDueDate && !qaDueDate.value) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            qaDueDate.value = tomorrow.toISOString().split('T')[0];
        }

        // Focus timer controls
        const startBtn = document.getElementById('focusStartBtn');
        const resetBtn = document.getElementById('focusResetBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleFocusTimer());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFocusTimer());
        }

        // Focus mode tabs (25m Focus, 5m Break, 15m Long Break)
        document.querySelectorAll('.focus-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.focus-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const minutes = parseInt(btn.getAttribute('data-mins'), 10);
                this.setFocusDuration(minutes);
            });
        });
    },

    // =========================================================================
    // FOCUS STUDY TIMER
    // =========================================================================
    initFocusTimer() {
        this.updateFocusDisplay();
    },

    setFocusDuration(minutes) {
        this.pauseFocusTimer();
        focusTotalDuration = minutes * 60;
        focusTimeRemaining = focusTotalDuration;
        this.updateFocusDisplay();
    },

    toggleFocusTimer() {
        if (isFocusTimerRunning) {
            this.pauseFocusTimer();
        } else {
            this.startFocusTimer();
        }
    },

    startFocusTimer() {
        isFocusTimerRunning = true;
        const startBtn = document.getElementById('focusStartBtn');
        if (startBtn) {
            startBtn.innerHTML = '<span>⏸ Pause</span>';
            startBtn.className = 'btn btn-secondary btn-sm';
        }

        focusTimerInterval = setInterval(() => {
            if (focusTimeRemaining > 0) {
                focusTimeRemaining--;
                this.updateFocusDisplay();
            } else {
                this.handleFocusTimerComplete();
            }
        }, 1000);
    },

    pauseFocusTimer() {
        isFocusTimerRunning = false;
        clearInterval(focusTimerInterval);
        const startBtn = document.getElementById('focusStartBtn');
        if (startBtn) {
            startBtn.innerHTML = '<span>▶ Start Focus</span>';
            startBtn.className = 'btn btn-primary btn-sm';
        }
    },

    resetFocusTimer() {
        this.pauseFocusTimer();
        focusTimeRemaining = focusTotalDuration;
        this.updateFocusDisplay();
    },

    handleFocusTimerComplete() {
        this.pauseFocusTimer();
        completedFocusSessions++;
        const countEl = document.getElementById('focusSessionCount');
        if (countEl) countEl.textContent = `${completedFocusSessions} session${completedFocusSessions > 1 ? 's' : ''}`;

        this.playChime();
        App.showToast('🎉 Focus session completed! Take a well-deserved break.', 'success', 5000);
        focusTimeRemaining = focusTotalDuration;
        this.updateFocusDisplay();
    },

    updateFocusDisplay() {
        const mins = Math.floor(focusTimeRemaining / 60);
        const secs = focusTimeRemaining % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        const displayEl = document.getElementById('focusTimeDisplay');
        if (displayEl) displayEl.textContent = formatted;

        // Update circular stroke offset if present
        const circle = document.getElementById('focusProgressCircle');
        if (circle) {
            const circumference = 2 * Math.PI * 45; // radius 45
            const progress = (focusTotalDuration - focusTimeRemaining) / focusTotalDuration;
            const offset = circumference * (1 - progress);
            circle.style.strokeDashoffset = offset;
        }
    },

    playChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
            // Audio not allowed or unavailable
        }
    },

    // =========================================================================
    // DASHBOARD DATA LOADER
    // =========================================================================
    async loadDashboardData() {
        try {
            const data = await TaskApi.getDashboardSummary();
            this.renderKPIs(data);
            this.renderUrgentDeadlines(data.upcomingDeadlines || []);
            this.renderRecentTasks(data.recentTasks || []);
            this.renderSubjectBreakdown(data.subjectBreakdown || {});
            
            // Update nav badges
            const pBadge = document.getElementById('pendingTasksBadge');
            const uBadge = document.getElementById('urgentDeadlinesBadge');
            if (pBadge) pBadge.textContent = data.pendingTasks + data.inProgressTasks;
            if (uBadge) uBadge.textContent = data.urgentTasksCount;
            
            App.setApiOnline(true);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            App.setApiOnline(false, error.message);
            App.showToast('Could not load dashboard data: ' + error.message, 'error');
        }
    },

    renderKPIs(data) {
        document.getElementById('kpiTotal').textContent = data.totalTasks || 0;
        document.getElementById('kpiPending').textContent = (data.pendingTasks || 0) + (data.inProgressTasks || 0);
        document.getElementById('kpiInProgressSub').textContent = `${data.inProgressTasks || 0} in progress`;
        document.getElementById('kpiCompleted').textContent = data.completedTasks || 0;
        document.getElementById('kpiCompletedRate').textContent = `${data.completionPercentage || 0}% finished`;
        document.getElementById('kpiOverdue').textContent = data.overdueTasks || 0;

        document.getElementById('dashboardProdScore').textContent = `${data.productivityScore || 0}%`;
        document.getElementById('dashboardCompRate').textContent = `${data.completionPercentage || 0}%`;

        // Dynamic welcome message
        const welcomeEl = document.getElementById('welcomeMessage');
        if (welcomeEl) {
            if (data.overdueTasks > 0) {
                welcomeEl.innerHTML = `⚠️ You have <strong class="highlight-danger">${data.overdueTasks} overdue task(s)</strong> that need attention today.`;
            } else if (data.urgentTasksCount > 0) {
                welcomeEl.innerHTML = `🎯 You have <strong>${data.urgentTasksCount} urgent deadlines</strong> coming up soon. Let's tackle them!`;
            } else {
                welcomeEl.textContent = '🌟 You are all caught up on urgent deadlines! Keep up the great momentum.';
            }
        }
    },

    renderUrgentDeadlines(tasks) {
        const container = document.getElementById('dashboardUrgentList');
        if (!tasks || tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎉</div>
                    <div class="empty-title">No Urgent Deadlines</div>
                    <p class="empty-desc">You don't have any pending deadlines right now.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskRowHtml(task)).join('');
        this.attachRowEvents(container);
    },

    renderRecentTasks(tasks) {
        const container = document.getElementById('dashboardRecentList');
        if (!tasks || tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <div class="empty-title">No Tasks Found</div>
                    <p class="empty-desc">Start adding coursework tasks to organize your semester.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskRowHtml(task)).join('');
        this.attachRowEvents(container);
    },

    createTaskRowHtml(task) {
        const isCompleted = task.status === 'COMPLETED';
        const isOverdue = task.overdue;
        
        let urgencyBadge = '';
        if (isOverdue) {
            urgencyBadge = `<span class="due-countdown-tag overdue">Overdue</span>`;
        } else if (task.daysRemaining === 0) {
            urgencyBadge = `<span class="due-countdown-tag today">Due Today</span>`;
        } else if (task.daysRemaining === 1) {
            urgencyBadge = `<span class="due-countdown-tag tomorrow">Tomorrow</span>`;
        } else if (task.daysRemaining <= 7) {
            urgencyBadge = `<span class="due-countdown-tag this-week">In ${task.daysRemaining} days</span>`;
        } else {
            urgencyBadge = `<span class="due-countdown-tag later">${task.formattedDue || task.dueDate}</span>`;
        }

        return `
            <div class="task-item-row" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-id="${task.id}" title="Toggle Complete">
                <div class="task-info-main">
                    <div class="task-header-line">
                        <span class="task-row-title ${isCompleted ? 'completed' : ''}" data-action="view" data-id="${task.id}">${App.escapeHtml(task.title)}</span>
                    </div>
                    <div class="task-meta-line">
                        <span class="badge badge-subject">${App.escapeHtml(task.subject)}</span>
                        <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
                        <span class="badge badge-${task.status.toLowerCase().replace('_', '-')}">${task.status.replace('_', ' ')}</span>
                        <span class="task-due-info">📅 ${urgencyBadge}</span>
                    </div>
                </div>
                <div class="task-row-actions">
                    <button class="action-btn-icon" data-action="edit" data-id="${task.id}" title="Edit Task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="action-btn-icon delete" data-action="delete" data-id="${task.id}" data-title="${App.escapeHtml(task.title)}" title="Delete Task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        `;
    },

    attachRowEvents(container) {
        // Checkbox complete toggle
        container.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                try {
                    await TaskApi.toggleComplete(id);
                    App.showToast('Task status updated', 'success');
                    App.refreshAllData();
                } catch (err) {
                    App.showToast(err.message, 'error');
                }
            });
        });

        // Click on title to view detail
        container.querySelectorAll('[data-action="view"]').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                TasksModule.openDetailModal(id);
            });
        });

        // Edit button
        container.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                TasksModule.openEditModal(id);
            });
        });

        // Delete button
        container.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const title = e.currentTarget.getAttribute('data-title');
                App.openDeleteConfirm(id, title);
            });
        });
    },

    renderSubjectBreakdown(subjectsMap) {
        const listContainer = document.getElementById('dashSubjectList');
        const subjects = Object.keys(subjectsMap);
        
        if (subjects.length === 0) {
            listContainer.innerHTML = '<span class="text-muted text-sm">No subjects recorded yet.</span>';
            return;
        }

        listContainer.innerHTML = subjects.map(s => `
            <span class="subject-pill-tag">
                ${App.escapeHtml(s)} <span class="count">${subjectsMap[s]}</span>
            </span>
        `).join('');

        // Render Chart.js Mini Donut
        const canvas = document.getElementById('dashSubjectChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (dashSubjectChartInstance) {
                dashSubjectChartInstance.destroy();
            }

            const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];

            dashSubjectChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: subjects,
                    datasets: [{
                        data: Object.values(subjectsMap),
                        backgroundColor: colors.slice(0, subjects.length),
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    cutout: '70%'
                }
            });
        }
    },

    async handleQuickAdd(e) {
        e.preventDefault();
        const title = document.getElementById('qaTitle').value.trim();
        const subject = document.getElementById('qaSubject').value.trim();
        const taskType = document.getElementById('qaType').value;
        const dueDate = document.getElementById('qaDueDate').value;
        const priority = document.getElementById('qaPriority').value;

        if (!title || !subject || !dueDate) {
            App.showToast('Please fill in all required fields.', 'warning');
            return;
        }

        try {
            await TaskApi.createTask({
                title,
                subject,
                taskType,
                dueDate,
                priority,
                status: 'PENDING'
            });

            App.showToast('Task added successfully!', 'success');
            document.getElementById('quickAddForm').reset();
            
            // Reset tomorrow date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('qaDueDate').value = tomorrow.toISOString().split('T')[0];

            App.refreshAllData();
        } catch (error) {
            App.showToast(error.message, 'error');
        }
    }
};

window.DashboardModule = DashboardModule;
