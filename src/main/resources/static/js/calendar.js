/**
 * ==========================================================================
 * CALENDAR MODULE (MONTHLY / DAY INSPECTOR)
 * ==========================================================================
 */

let calCurrentDate = new Date();
let calSelectedDate = null;
let currentMonthTasks = [];

const CalendarModule = {
    async init() {
        this.bindEvents();
        await this.renderCalendar();
    },

    bindEvents() {
        const prevBtn = document.getElementById('calPrevMonthBtn');
        const nextBtn = document.getElementById('calNextMonthBtn');
        const todayBtn = document.getElementById('calTodayBtn');
        const addDayTaskBtn = document.getElementById('addDayTaskBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
                this.renderCalendar();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                calCurrentDate = new Date();
                this.renderCalendar();
            });
        }

        if (addDayTaskBtn) {
            addDayTaskBtn.addEventListener('click', () => {
                if (calSelectedDate) {
                    TasksModule.openAddModal(calSelectedDate);
                } else {
                    TasksModule.openAddModal();
                }
            });
        }
    },

    async renderCalendar() {
        const year = calCurrentDate.getFullYear();
        const month = calCurrentDate.getMonth(); // 0-indexed

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const monthTitle = document.getElementById('calMonthTitle');
        if (monthTitle) {
            monthTitle.textContent = `${monthNames[month]} ${year}`;
        }

        // Fetch month tasks from backend
        try {
            currentMonthTasks = await TaskApi.getCalendarTasks(year, month + 1);
        } catch (e) {
            console.warn('Could not fetch calendar tasks:', e);
            currentMonthTasks = [];
        }

        const grid = document.getElementById('calendarDaysGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        // Group tasks by date string (YYYY-MM-DD)
        const tasksByDate = {};
        currentMonthTasks.forEach(task => {
            if (task.dueDate) {
                if (!tasksByDate[task.dueDate]) {
                    tasksByDate[task.dueDate] = [];
                }
                tasksByDate[task.dueDate].push(task);
            }
        });

        // 1. Previous Month Leading Days
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dayNum = totalDaysInPrevMonth - i;
            const prevMonthDate = new Date(year, month - 1, dayNum);
            const dateStr = this.formatDateString(prevMonthDate);
            const cell = this.createDayCell(dayNum, true, false, dateStr, tasksByDate[dateStr] || []);
            grid.appendChild(cell);
        }

        // 2. Current Month Days
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = this.formatDateString(dateObj);
            const isToday = isCurrentMonth && today.getDate() === day;
            const dayTasks = tasksByDate[dateStr] || [];
            const cell = this.createDayCell(day, false, isToday, dateStr, dayTasks);
            grid.appendChild(cell);
        }

        // 3. Next Month Trailing Days (fill 35 or 42 grid cells)
        const totalCellsRendered = firstDayOfMonth + totalDaysInMonth;
        const totalGridSlots = totalCellsRendered > 35 ? 42 : 35;
        const nextMonthDaysCount = totalGridSlots - totalCellsRendered;

        for (let day = 1; day <= nextMonthDaysCount; day++) {
            const nextMonthDate = new Date(year, month + 1, day);
            const dateStr = this.formatDateString(nextMonthDate);
            const cell = this.createDayCell(day, true, false, dateStr, tasksByDate[dateStr] || []);
            grid.appendChild(cell);
        }
    },

    createDayCell(dayNumber, isOtherMonth, isToday, dateString, tasks) {
        const cell = document.createElement('div');
        cell.className = `cal-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${tasks.length > 0 ? 'has-tasks' : ''}`;
        cell.setAttribute('data-date', dateString);

        let tasksHtml = '';
        const maxDisplay = 3;
        tasks.slice(0, maxDisplay).forEach(task => {
            const isDone = task.status === 'COMPLETED';
            tasksHtml += `
                <div class="cal-event-pill priority-${task.priority} status-${task.status}" title="${App.escapeHtml(task.title)} (${task.subject})">
                    <span>${isDone ? '✓ ' : ''}${App.escapeHtml(task.title)}</span>
                </div>
            `;
        });

        if (tasks.length > maxDisplay) {
            tasksHtml += `<div class="more-events-tag">+${tasks.length - maxDisplay} more</div>`;
        }

        cell.innerHTML = `
            <div class="cal-day-header">
                <span class="cal-day-num">${dayNumber}</span>
                ${tasks.length > 0 ? `<span class="cal-task-count">${tasks.length} task${tasks.length > 1 ? 's' : ''}</span>` : ''}
            </div>
            <div class="cal-events-list">${tasksHtml}</div>
        `;

        cell.addEventListener('click', () => {
            document.querySelectorAll('.cal-day-cell').forEach(c => c.style.outline = 'none');
            cell.style.outline = '2px solid var(--primary)';
            this.showDayTasks(dateString, tasks);
        });

        return cell;
    },

    showDayTasks(dateString, tasks) {
        calSelectedDate = dateString;
        const panel = document.getElementById('selectedDayPanel');
        const titleEl = document.getElementById('selectedDayTitle');
        const listEl = document.getElementById('selectedDayTaskList');

        if (!panel || !titleEl || !listEl) return;

        const dateObj = new Date(dateString + 'T00:00:00');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        titleEl.textContent = `Tasks for ${dateObj.toLocaleDateString(undefined, options)}`;

        panel.style.display = 'block';

        if (tasks.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state" style="padding: 24px;">
                    <p class="text-muted">No tasks due on this date.</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = tasks.map(task => DashboardModule.createTaskRowHtml(task)).join('');
        DashboardModule.attachRowEvents(listEl);
    },

    formatDateString(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
};

window.CalendarModule = CalendarModule;
