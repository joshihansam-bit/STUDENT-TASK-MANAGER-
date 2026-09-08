/**
 * ==========================================================================
 * ANALYTICS & PROGRESS MODULE (CHART.JS VISUALIZATIONS)
 * ==========================================================================
 */

let chartSubjectsInstance = null;
let chartStatusInstance = null;
let chartPriorityInstance = null;
let chartVelocityInstance = null;

const AnalyticsModule = {
    async init() {
        await this.loadAnalyticsData();
    },

    async loadAnalyticsData() {
        try {
            const data = await TaskApi.getAnalytics();
            this.renderScoreAndMetrics(data);
            this.renderCharts(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
            App.showToast('Could not load analytics: ' + error.message, 'error');
        }
    },

    renderScoreAndMetrics(data) {
        document.getElementById('analyticsScore').textContent = data.productivityScore || 0;
        
        const verdictEl = document.getElementById('analyticsScoreVerdict');
        const score = data.productivityScore || 0;
        if (score >= 85) {
            verdictEl.textContent = '🔥 Outstanding Academic Pace!';
            verdictEl.style.color = '#10b981';
        } else if (score >= 65) {
            verdictEl.textContent = '👍 Good Pace — Keep It Up!';
            verdictEl.style.color = '#3b82f6';
        } else if (score >= 45) {
            verdictEl.textContent = '⚡ Room for improvement';
            verdictEl.style.color = '#f59e0b';
        } else {
            verdictEl.textContent = '⚠️ Focus needed on overdue tasks';
            verdictEl.style.color = '#ef4444';
        }

        // Completion Rate
        document.getElementById('analyticsCompletionRate').textContent = `${data.completionRate || 0}%`;
        document.getElementById('analyticsProgressFill').style.width = `${data.completionRate || 0}%`;
        document.getElementById('analyticsTasksRatio').textContent = `${data.completedTasks || 0} of ${data.totalTasks || 0} tasks completed`;

        // Estimated Workload
        document.getElementById('analyticsTotalHours').textContent = `${data.totalEstimatedHours || 0} hrs`;
        document.getElementById('analyticsCompletedHours').textContent = `${data.completedEstimatedHours || 0} hrs completed so far`;

        // Active Backlog
        document.getElementById('analyticsBacklog').textContent = (data.pendingTasks || 0);
        document.getElementById('analyticsOverdueCount').textContent = `${data.overdueTasks || 0} overdue tasks`;
    },

    renderCharts(data) {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const textColor = isDark ? '#9ca3af' : '#4b5563';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

        // 1. Subject Workload Chart
        const subCanvas = document.getElementById('chartSubjects');
        if (subCanvas) {
            const ctx = subCanvas.getContext('2d');
            if (chartSubjectsInstance) chartSubjectsInstance.destroy();

            const subjects = Object.keys(data.tasksBySubject || {});
            const counts = Object.values(data.tasksBySubject || {});

            chartSubjectsInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: subjects.length > 0 ? subjects : ['No Subjects'],
                    datasets: [{
                        label: 'Tasks Count',
                        data: counts.length > 0 ? counts : [0],
                        backgroundColor: '#6366f1',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { display: false } },
                        y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
                    }
                }
            });
        }

        // 2. Status Breakdown Chart
        const statusCanvas = document.getElementById('chartStatus');
        if (statusCanvas) {
            const ctx = statusCanvas.getContext('2d');
            if (chartStatusInstance) chartStatusInstance.destroy();

            const statusMap = data.tasksByStatus || {};
            chartStatusInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
                    datasets: [{
                        data: [
                            statusMap.COMPLETED || 0,
                            statusMap.IN_PROGRESS || 0,
                            statusMap.PENDING || 0,
                            statusMap.OVERDUE || 0
                        ],
                        backgroundColor: ['#10b981', '#3b82f6', '#a855f7', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: textColor, padding: 14 } }
                    },
                    cutout: '65%'
                }
            });
        }

        // 3. Priority Distribution Chart
        const prioCanvas = document.getElementById('chartPriority');
        if (prioCanvas) {
            const ctx = prioCanvas.getContext('2d');
            if (chartPriorityInstance) chartPriorityInstance.destroy();

            const prioMap = data.tasksByPriority || {};
            chartPriorityInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Urgent', 'High', 'Medium', 'Low'],
                    datasets: [{
                        data: [
                            prioMap.URGENT || 0,
                            prioMap.HIGH || 0,
                            prioMap.MEDIUM || 0,
                            prioMap.LOW || 0
                        ],
                        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: textColor, padding: 14 } }
                    }
                }
            });
        }

        // 4. 7-Day Velocity Chart
        const velCanvas = document.getElementById('chartVelocity');
        if (velCanvas) {
            const ctx = velCanvas.getContext('2d');
            if (chartVelocityInstance) chartVelocityInstance.destroy();

            const velocityList = data.weeklyVelocity || [];
            const labels = velocityList.map(v => `${v.dayOfWeek} (${v.date})`);
            const counts = velocityList.map(v => v.completedCount);

            chartVelocityInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Tasks Completed',
                        data: counts,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        tension: 0.35,
                        fill: true,
                        pointBackgroundColor: '#10b981',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { display: false } },
                        y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true }
                    }
                }
            });
        }
    }
};

window.AnalyticsModule = AnalyticsModule;
