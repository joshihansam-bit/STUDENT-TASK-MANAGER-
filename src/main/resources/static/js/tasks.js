/**
 * ==========================================================================
 * TASKS MODULE (CRUD, FILTERS, SEARCH, SORT, DEADLINES, COMPLETED ARCHIVE)
 * ==========================================================================
 */

let currentViewMode = 'grid'; // 'grid' or 'list'
let activeFilterStatus = '';
let currentEditingTaskId = null;

const TasksModule = {
    async init() {
        this.bindEvents();
        await this.loadSubjects();
        await this.loadTasks();
    },

    bindEvents() {
        // Status filter tabs
        document.querySelectorAll('#taskStatusTabs .filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('#taskStatusTabs .filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeFilterStatus = tab.getAttribute('data-status');
                this.loadTasks();
            });
        });

        // Filter dropdowns
        ['filterSubject', 'filterPriority', 'filterType', 'filterSortBy'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.loadTasks());
            }
        });

        // View Mode Toggles
        const viewGridBtn = document.getElementById('viewGridBtn');
        const viewListBtn = document.getElementById('viewListBtn');
        if (viewGridBtn && viewListBtn) {
            viewGridBtn.addEventListener('click', () => {
                viewGridBtn.classList.add('active');
                viewListBtn.classList.remove('active');
                currentViewMode = 'grid';
                this.loadTasks();
            });
            viewListBtn.addEventListener('click', () => {
                viewListBtn.classList.add('active');
                viewGridBtn.classList.remove('active');
                currentViewMode = 'list';
                this.loadTasks();
            });
        }

        // Add Task Modal Form Submit
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleSaveTask(e));
        }

        // Modal Close buttons
        const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');
        const cancelTaskModalBtn = document.getElementById('cancelTaskModalBtn');
        if (closeTaskModalBtn) closeTaskModalBtn.addEventListener('click', () => this.closeTaskModal());
        if (cancelTaskModalBtn) cancelTaskModalBtn.addEventListener('click', () => this.closeTaskModal());

        // Task Detail Modal Actions
        const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
        const closeDetailBtn = document.getElementById('closeDetailBtn');
        const detailEditBtn = document.getElementById('detailEditBtn');
        const detailToggleCompleteBtn = document.getElementById('detailToggleCompleteBtn');

        if (closeDetailModalBtn) closeDetailModalBtn.addEventListener('click', () => this.closeDetailModal());
        if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => this.closeDetailModal());

        if (detailEditBtn) {
            detailEditBtn.addEventListener('click', () => {
                const id = detailEditBtn.getAttribute('data-id');
                this.closeDetailModal();
                this.openEditModal(id);
            });
        }

        if (detailToggleCompleteBtn) {
            detailToggleCompleteBtn.addEventListener('click', async () => {
                const id = detailToggleCompleteBtn.getAttribute('data-id');
                try {
                    await TaskApi.toggleComplete(id);
                    App.showToast('Task status updated', 'success');
                    this.closeDetailModal();
                    App.refreshAllData();
                } catch (err) {
                    App.showToast(err.message, 'error');
                }
            });
        }

        // Completed archive search
        const completedSearchInput = document.getElementById('completedSearchInput');
        if (completedSearchInput) {
            completedSearchInput.addEventListener('input', App.debounce(() => this.loadCompletedTasks(), 300));
        }
    },

    async loadSubjects() {
        try {
            const subjects = await TaskApi.getSubjects();
            const filterSubject = document.getElementById('filterSubject');
            const datalist = document.getElementById('subjectDatalist');

            if (filterSubject) {
                const currentVal = filterSubject.value;
                filterSubject.innerHTML = '<option value="">All Subjects</option>';
                subjects.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s;
                    opt.textContent = s;
                    if (s === currentVal) opt.selected = true;
                    filterSubject.appendChild(opt);
                });
            }

            if (datalist && subjects.length > 0) {
                datalist.innerHTML = subjects.map(s => `<option value="${App.escapeHtml(s)}">`).join('');
            }
        } catch (e) {
            console.warn('Could not load subjects list:', e);
        }
    },

    async loadTasks() {
        const container = document.getElementById('tasksContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading tasks...</p>
            </div>
        `;

        try {
            const subject = document.getElementById('filterSubject')?.value;
            const priority = document.getElementById('filterPriority')?.value;
            const taskType = document.getElementById('filterType')?.value;
            const sortRaw = document.getElementById('filterSortBy')?.value || 'dueDate';
            const search = document.getElementById('globalSearchInput')?.value;

            let sortBy = 'dueDate';
            let sortDirection = 'ASC';
            if (sortRaw.includes('_DESC')) {
                sortBy = sortRaw.replace('_DESC', '');
                sortDirection = 'DESC';
            } else {
                sortBy = sortRaw;
                sortDirection = 'ASC';
            }

            const tasks = await TaskApi.getAllTasks({
                search,
                subject,
                priority,
                status: activeFilterStatus || undefined,
                taskType,
                sortBy,
                sortDirection
            });

            this.updateTabCounts(tasks);

            if (tasks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📂</div>
                        <div class="empty-title">No Tasks Found</div>
                        <p class="empty-desc">No tasks match your current filter or search criteria.</p>
                        <button class="btn btn-primary btn-sm" onclick="TasksModule.openAddModal()">+ Create New Task</button>
                    </div>
                `;
                return;
            }

            if (currentViewMode === 'grid') {
                container.className = 'tasks-grid';
                container.innerHTML = tasks.map(task => this.createTaskCardHtml(task)).join('');
            } else {
                container.className = 'tasks-table-wrapper';
                container.innerHTML = this.createTasksTableHtml(tasks);
            }

            this.attachTaskEvents(container);

        } catch (error) {
            console.error('Error loading tasks:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <div class="empty-title">Error Loading Tasks</div>
                    <p class="empty-desc">${error.message}</p>
                    <button class="btn btn-secondary btn-sm" onclick="TasksModule.loadTasks()">Retry</button>
                </div>
            `;
        }
    },

    updateTabCounts(tasks) {
        // Can also fetch overall dashboard stats for exact counts
        TaskApi.getDashboardSummary().then(data => {
            const allCount = (data.pendingTasks || 0) + (data.inProgressTasks || 0) + (data.completedTasks || 0) + (data.overdueTasks || 0);
            document.getElementById('tabCountAll').textContent = allCount;
            document.getElementById('tabCountPending').textContent = data.pendingTasks || 0;
            document.getElementById('tabCountProgress').textContent = data.inProgressTasks || 0;
            document.getElementById('tabCountOverdue').textContent = data.overdueTasks || 0;
        }).catch(() => {});
    },

    createTaskCardHtml(task) {
        const isCompleted = task.status === 'COMPLETED';
        const isOverdue = task.overdue;

        let urgencyTag = '';
        if (isOverdue) {
            urgencyTag = `<span class="due-countdown-tag overdue">⚠️ Overdue</span>`;
        } else if (task.daysRemaining === 0) {
            urgencyTag = `<span class="due-countdown-tag today">Due Today</span>`;
        } else if (task.daysRemaining === 1) {
            urgencyTag = `<span class="due-countdown-tag tomorrow">Tomorrow</span>`;
        } else if (task.daysRemaining <= 7) {
            urgencyTag = `<span class="due-countdown-tag this-week">In ${task.daysRemaining} days</span>`;
        } else {
            urgencyTag = `<span class="due-countdown-tag later">${task.formattedDue || task.dueDate}</span>`;
        }

        const tagsList = task.tags ? task.tags.split(',').map(t => `<span class="subject-pill-tag">${App.escapeHtml(t.trim())}</span>`).join('') : '';

        return `
            <div class="task-card priority-${task.priority} status-${task.status}" data-id="${task.id}">
                <div class="task-card-header">
                    <span class="badge badge-subject">${App.escapeHtml(task.subject)}</span>
                    <div style="display: flex; gap: 6px;">
                        <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
                        <span class="badge badge-${task.status.toLowerCase().replace('_', '-')}">${task.status.replace('_', ' ')}</span>
                    </div>
                </div>

                <div class="task-card-body">
                    <h3 class="task-card-title ${isCompleted ? 'completed' : ''}" data-action="view" data-id="${task.id}">
                        ${App.escapeHtml(task.title)}
                    </h3>
                    ${task.description ? `<p class="task-card-desc">${App.escapeHtml(task.description)}</p>` : ''}
                    
                    <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 4px;">
                        ${tagsList}
                    </div>
                </div>

                <div class="task-card-footer">
                    <div class="task-due-info">
                        ${urgencyTag}
                        ${task.estimatedHours ? `<span class="text-muted text-sm" style="margin-left: 6px;">⏱️ ${task.estimatedHours}h</span>` : ''}
                    </div>

                    <div class="task-card-actions">
                        <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-id="${task.id}" title="Toggle Complete">
                        <button class="action-btn-icon" data-action="edit" data-id="${task.id}" title="Edit Task">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="action-btn-icon delete" data-action="delete" data-id="${task.id}" data-title="${App.escapeHtml(task.title)}" title="Delete Task">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    createTasksTableHtml(tasks) {
        const rows = tasks.map(task => {
            const isCompleted = task.status === 'COMPLETED';
            return `
                <tr data-id="${task.id}">
                    <td style="width: 40px;">
                        <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-id="${task.id}">
                    </td>
                    <td>
                        <span class="task-row-title ${isCompleted ? 'completed' : ''}" data-action="view" data-id="${task.id}">
                            ${App.escapeHtml(task.title)}
                        </span>
                    </td>
                    <td><span class="badge badge-subject">${App.escapeHtml(task.subject)}</span></td>
                    <td><span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span></td>
                    <td><span class="badge badge-${task.status.toLowerCase().replace('_', '-')}">${task.status.replace('_', ' ')}</span></td>
                    <td>${task.formattedDue || task.dueDate}</td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button class="action-btn-icon" data-action="edit" data-id="${task.id}" title="Edit">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="action-btn-icon delete" data-action="delete" data-id="${task.id}" data-title="${App.escapeHtml(task.title)}" title="Delete">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <table class="tasks-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Task Title</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    },

    attachTaskEvents(container) {
        // Toggle complete checkbox
        container.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                try {
                    await TaskApi.toggleComplete(id);
                    App.showToast('Task updated', 'success');
                    App.refreshAllData();
                } catch (err) {
                    App.showToast(err.message, 'error');
                }
            });
        });

        // View detail click
        container.querySelectorAll('[data-action="view"]').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.openDetailModal(id);
            });
        });

        // Edit click
        container.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.openEditModal(id);
            });
        });

        // Delete click
        container.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const title = e.currentTarget.getAttribute('data-title');
                App.openDeleteConfirm(id, title);
            });
        });
    },

    // =========================================================================
    // MODALS: ADD / EDIT
    // =========================================================================
    openAddModal(defaultDate = null) {
        currentEditingTaskId = null;
        document.getElementById('taskModalTitle').textContent = 'Create New Task';
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        document.getElementById('taskFormError').style.display = 'none';

        // Set default due date
        const dateInput = document.getElementById('taskDueDate');
        if (defaultDate) {
            dateInput.value = defaultDate;
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }

        const modal = document.getElementById('taskModal');
        if (modal) modal.showModal();
    },

    async openEditModal(id) {
        currentEditingTaskId = id;
        document.getElementById('taskModalTitle').textContent = 'Edit Task';
        document.getElementById('taskFormError').style.display = 'none';

        try {
            const task = await TaskApi.getTaskById(id);
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskSubject').value = task.subject;
            document.getElementById('taskType').value = task.taskType;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskDueTime').value = task.dueTime || '';
            document.getElementById('taskEstimatedHours').value = task.estimatedHours || '';
            document.getElementById('taskTags').value = task.tags || '';
            document.getElementById('taskDescription').value = task.description || '';

            const modal = document.getElementById('taskModal');
            if (modal) modal.showModal();
        } catch (error) {
            App.showToast('Could not load task details: ' + error.message, 'error');
        }
    },

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        if (modal) modal.close();
    },

    async handleSaveTask(e) {
        e.preventDefault();
        const errBanner = document.getElementById('taskFormError');
        errBanner.style.display = 'none';

        const id = document.getElementById('taskId').value;
        const title = document.getElementById('taskTitle').value.trim();
        const subject = document.getElementById('taskSubject').value.trim();
        const taskType = document.getElementById('taskType').value;
        const priority = document.getElementById('taskPriority').value;
        const status = document.getElementById('taskStatus').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const dueTime = document.getElementById('taskDueTime').value || null;
        const estimatedHours = document.getElementById('taskEstimatedHours').value ? parseFloat(document.getElementById('taskEstimatedHours').value) : null;
        const tags = document.getElementById('taskTags').value.trim() || null;
        const description = document.getElementById('taskDescription').value.trim() || null;

        if (!title || !subject || !dueDate) {
            errBanner.textContent = 'Please fill in all required fields (Title, Subject, Due Date).';
            errBanner.style.display = 'block';
            return;
        }

        const taskData = {
            title,
            subject,
            taskType,
            priority,
            status,
            dueDate,
            dueTime,
            estimatedHours,
            tags,
            description
        };

        const saveBtn = document.getElementById('saveTaskBtn');
        saveBtn.disabled = true;

        try {
            if (id) {
                await TaskApi.updateTask(id, taskData);
                App.showToast('Task updated successfully!', 'success');
            } else {
                await TaskApi.createTask(taskData);
                App.showToast('Task created successfully!', 'success');
            }

            this.closeTaskModal();
            App.refreshAllData();
        } catch (error) {
            errBanner.textContent = error.message;
            errBanner.style.display = 'block';
        } finally {
            saveBtn.disabled = false;
        }
    },

    // =========================================================================
    // TASK DETAIL MODAL
    // =========================================================================
    async openDetailModal(id) {
        try {
            const task = await TaskApi.getTaskById(id);

            document.getElementById('detailTitle').textContent = task.title;
            document.getElementById('detailSubject').textContent = task.subject;
            document.getElementById('detailDueDate').textContent = task.formattedDue || task.dueDate;
            document.getElementById('detailHours').textContent = task.estimatedHours ? `${task.estimatedHours} hours` : 'Not specified';
            document.getElementById('detailCreated').textContent = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A';
            document.getElementById('detailDescription').textContent = task.description || 'No additional instructions or notes provided.';

            // Badges
            const typeBadge = document.getElementById('detailTypeBadge');
            typeBadge.textContent = task.taskType;
            
            const priBadge = document.getElementById('detailPriorityBadge');
            priBadge.className = `badge badge-${task.priority.toLowerCase()}`;
            priBadge.textContent = task.priority;

            const stBadge = document.getElementById('detailStatusBadge');
            stBadge.className = `badge badge-${task.status.toLowerCase().replace('_', '-')}`;
            stBadge.textContent = task.status.replace('_', ' ');

            // Tags
            const tagsSection = document.getElementById('detailTagsSection');
            const tagsList = document.getElementById('detailTagsList');
            if (task.tags) {
                tagsSection.style.display = 'block';
                tagsList.innerHTML = task.tags.split(',').map(t => `<span class="subject-pill-tag">${App.escapeHtml(t.trim())}</span>`).join('');
            } else {
                tagsSection.style.display = 'none';
            }

            // Action buttons config
            const editBtn = document.getElementById('detailEditBtn');
            const toggleBtn = document.getElementById('detailToggleCompleteBtn');
            editBtn.setAttribute('data-id', task.id);
            toggleBtn.setAttribute('data-id', task.id);

            if (task.status === 'COMPLETED') {
                toggleBtn.textContent = 'Reopen Task';
                toggleBtn.className = 'btn btn-outline';
            } else {
                toggleBtn.textContent = 'Mark as Completed';
                toggleBtn.className = 'btn btn-primary';
            }

            const modal = document.getElementById('taskDetailModal');
            if (modal) modal.showModal();
        } catch (error) {
            App.showToast('Could not load task details: ' + error.message, 'error');
        }
    },

    closeDetailModal() {
        const modal = document.getElementById('taskDetailModal');
        if (modal) modal.close();
    },

    // =========================================================================
    // DEADLINES TRACKER PAGE
    // =========================================================================
    async loadDeadlinesPage() {
        try {
            const allTasks = await TaskApi.getAllTasks({ sortBy: 'dueDate', sortDirection: 'ASC' });
            
            const overdue = allTasks.filter(t => t.status !== 'COMPLETED' && t.overdue);
            const today = allTasks.filter(t => t.status !== 'COMPLETED' && !t.overdue && t.daysRemaining === 0);
            const tomorrow = allTasks.filter(t => t.status !== 'COMPLETED' && !t.overdue && t.daysRemaining === 1);
            const thisWeek = allTasks.filter(t => t.status !== 'COMPLETED' && !t.overdue && t.daysRemaining > 1 && t.daysRemaining <= 7);
            const later = allTasks.filter(t => t.status !== 'COMPLETED' && !t.overdue && t.daysRemaining > 7);

            this.renderDeadlineGroup('Overdue', overdue, document.getElementById('deadlinesOverdueList'), document.getElementById('countOverdueGroup'), document.getElementById('groupOverdue'));
            this.renderDeadlineGroup('Today', today, document.getElementById('deadlinesTodayList'), document.getElementById('countTodayGroup'), document.getElementById('groupToday'));
            this.renderDeadlineGroup('Tomorrow', tomorrow, document.getElementById('deadlinesTomorrowList'), document.getElementById('countTomorrowGroup'), document.getElementById('groupTomorrow'));
            this.renderDeadlineGroup('ThisWeek', thisWeek, document.getElementById('deadlinesWeekList'), document.getElementById('countWeekGroup'), document.getElementById('groupThisWeek'));
            this.renderDeadlineGroup('Later', later, document.getElementById('deadlinesLaterList'), document.getElementById('countLaterGroup'), document.getElementById('groupLater'));

        } catch (e) {
            console.error('Error loading deadlines:', e);
        }
    },

    renderDeadlineGroup(name, tasks, container, countEl, groupEl) {
        if (!container || !countEl || !groupEl) return;
        countEl.textContent = tasks.length;
        
        if (tasks.length === 0) {
            container.innerHTML = `<span class="text-muted text-sm" style="padding: 10px 0;">No tasks in this timeframe.</span>`;
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskCardHtml(task)).join('');
        this.attachTaskEvents(container);
    },

    // =========================================================================
    // COMPLETED ARCHIVE PAGE
    // =========================================================================
    async loadCompletedTasks() {
        const container = document.getElementById('completedTasksContainer');
        if (!container) return;

        try {
            const search = document.getElementById('completedSearchInput')?.value;
            const tasks = await TaskApi.getAllTasks({
                status: 'COMPLETED',
                search: search || undefined,
                sortBy: 'dueDate',
                sortDirection: 'DESC'
            });

            document.getElementById('archiveCompletedCount').textContent = tasks.length;

            if (tasks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🏆</div>
                        <div class="empty-title">No Completed Tasks</div>
                        <p class="empty-desc">Completed assignments and projects will be archived here.</p>
                    </div>
                `;
                return;
            }

            container.className = 'tasks-grid';
            container.innerHTML = tasks.map(task => this.createTaskCardHtml(task)).join('');
            this.attachTaskEvents(container);

        } catch (error) {
            console.error('Error loading completed tasks:', error);
        }
    }
};

window.TasksModule = TasksModule;
