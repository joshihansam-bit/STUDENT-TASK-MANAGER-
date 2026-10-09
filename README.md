# 🎓 StudyFlow - Student Task Manager

A modern, responsive, full-stack **Student Task Manager web application** designed specifically for college and university students to organize assignments, track exam preparations, monitor deadlines, and visualize academic productivity.

---

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3 (Modern Glassmorphism Design System, CSS Custom Properties, Dark/Light Mode), Vanilla JavaScript (ES6+), [Chart.js](https://www.chartjs.org/) for analytics.
- **Backend**: **Java 17+ / 21**, **Spring Boot 3.3.x**, Spring Data JPA, Hibernate, Jakarta Validation, Spring Web MVC.
- **Database**: **MySQL 8.0+** (with relational schema, indexes, and sample seed data).
- **API Architecture**: Clean RESTful APIs with JSON payloads, global error handling, and CORS support.

---

## ✨ Main Features

1. 📊 **Comprehensive Dashboard**:
   - Total, Pending, Completed, and Overdue task counters with animated KPIs.
   - Real-time Productivity Score and Completion Rate calculation.
   - Urgent Deadlines summary with dynamic alert indicators.
   - Quick Add widget for rapid task entry.
   - Subject breakdown mini-chart.

2. 📋 **My Tasks Management (Full CRUD)**:
   - **Create**: Add new tasks with title, course/subject, type, priority, due date/time, estimated effort hours, tags, and instructions.
   - **Read**: Card grid view and compact table view.
   - **Update**: Edit any task details via an accessible modal dialog.
   - **Delete**: Permanent deletion with safe confirmation modal dialog.
   - **Complete**: One-click toggle between pending and completed states.

3. 🔍 **Search, Filter & Multi-Criteria Sort**:
   - Instant real-time search with debounce across titles, descriptions, subjects, and tags.
   - Filter by Subject (dynamically populated from database), Priority (Low, Medium, High, Urgent), Status (Pending, In Progress, Overdue), and Task Type (Assignment, Project, Exam Prep, Lab Report, Reading, Presentation, Other).
   - Sort by Due Date (Earliest / Latest), Priority (Highest), Title (A-Z), and Recently Added.

4. 📅 **Interactive Academic Calendar**:
   - Monthly calendar grid (Sun–Sat) with previous and next month day fillers.
   - Color-coded task markers/pills on dates corresponding to deadlines.
   - Highlighted "Today" cell.
   - Click on any day to inspect all tasks due on that day and quickly create tasks for that date.

5. ⏰ **Upcoming Deadlines Tracker**:
   - Categorized by urgency: **Overdue** (immediate action needed), **Due Today**, **Due Tomorrow**, **This Week** (next 7 days), and **Later**.
   - Visual countdown badges and estimated workload hours.

6. 📈 **Analytics & Productivity Insights**:
   - Academic Productivity Score (0-100) based on on-time completion ratios and overdue penalties.
   - Total estimated study hours vs completed study hours.
   - Interactive charts:
     - 📊 *Subject Workload Distribution* (Bar chart)
     - 🍩 *Task Status Breakdown* (Donut chart)
     - 🥧 *Priority Distribution* (Pie chart)
     - 📈 *7-Day Completion Velocity* (Line chart)

7. ✅ **Completed Tasks Archive**:
   - Dedicated history of conquered tasks with completion dates and hours logged.
   - Option to reopen/restore tasks to active status.

8. 🌓 **Dark & Light Modern Design**:
   - Seamless toggle between Dark and Light mode with persistent `localStorage` preference.
   - Responsive sidebar drawer for mobile and tablet devices.
   - Toast notification alerts for success/error feedback.

---

## 📁 Project Structure

```
student-task-manager/
├── pom.xml                               # Maven project configuration & dependencies
├── schema.sql                            # Standalone MySQL schema and sample records
├── README.md                             # Complete project documentation and guide
└── src/
    └── main/
        ├── java/com/studenttasks/
        │   ├── StudentTaskManagerApplication.java   # Spring Boot Main Entry Point
        │   ├── config/
        │   │   ├── CorsConfig.java                  # Cross-Origin configuration
        │   │   └── DataInitializer.java             # Automatic sample data loader
        │   ├── controller/
        │   │   └── TaskController.java              # REST API Endpoints
        │   ├── dto/
        │   │   ├── TaskRequestDto.java              # Request validation schema
        │   │   ├── TaskResponseDto.java             # Enriched response object
        │   │   ├── DashboardSummaryDto.java         # KPI summary model
        │   │   └── AnalyticsDto.java                # Charts & stats model
        │   ├── entity/
        │   │   ├── Task.java                        # JPA Entity for MySQL
        │   │   ├── TaskPriority.java                # LOW, MEDIUM, HIGH, URGENT
        │   │   ├── TaskStatus.java                  # PENDING, IN_PROGRESS, COMPLETED, OVERDUE
        │   │   └── TaskType.java                    # ASSIGNMENT, PROJECT, EXAM_PREP, etc.
        │   ├── exception/
        │   │   ├── ResourceNotFoundException.java   # 404 Exception
        │   │   ├── ApiErrorResponse.java            # Standard JSON error model
        │   │   └── GlobalExceptionHandler.java      # REST error handler
        │   ├── repository/
        │   │   └── TaskRepository.java              # Spring Data JPA + queries
        │   └── service/
        │       ├── TaskService.java                 # Service Interface
        │       └── impl/TaskServiceImpl.java        # Business logic & metrics
        └── resources/
            ├── application.properties               # MySQL & Spring configuration
            └── static/                              # Frontend Single Page App
                ├── index.html                       # HTML5 Semantic Layout
                ├── css/
                │   ├── style.css                    # Design system & dark/light theme
                │   └── calendar.css                 # Interactive calendar styles
                └── js/
                    ├── api.js                       # Fetch client for REST endpoints
                    ├── app.js                       # Router, theme, modals, toasts
                    ├── dashboard.js                 # Dashboard counters & quick add
                    ├── tasks.js                     # CRUD, filters, search, deadlines
                    ├── calendar.js                  # Dynamic month calendar
                    └── analytics.js                 # Chart.js visualizations
```

---

## 🛠️ Prerequisites

Before running the application, make sure you have:

1. **Java Development Kit (JDK 17 or 21)** installed.
   - Verify with: `java -version`
2. **Apache Maven (3.8+)** installed.
   - Verify with: `mvn -version`
3. **MySQL Server (8.0+)** installed and running.
   - Verify with: `mysql -u root -p`
4. **Visual Studio Code** (or IntelliJ IDEA / Eclipse).

---

## ⚙️ Step-by-Step Setup Guide in VS Code

### Step 1: Clone or Open the Project in VS Code
1. Launch **VS Code**.
2. Go to **File > Open Folder...** and select the `student-task-manager` folder.
3. Install recommended VS Code Extensions:
   - **Extension Pack for Java** (by Microsoft)
   - **Spring Boot Extension Pack** (by VMware)
   - **Live Server** (by Ritwick Dey, optional for standalone frontend dev)

---

### Step 2: Configure MySQL Database
1. Make sure MySQL Server is running. On Windows, check the service status or run:
   ```powershell
   Get-Service MySQL80
   # If stopped, start it:
   Start-Service MySQL80
   ```
2. Verify or update `src/main/resources/application.properties` with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/student_task_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=hanjo@077##**$$
   ```
   *(You can also override the password using an environment variable or change it to match your local MySQL root password.)*
3. The database `student_task_db`, tables, and default student profile will be **automatically created and seeded with realistic sample coursework** by Spring Boot on first startup! A standalone [`schema.sql`](file:///C:/Users/HANSAM%20JOSHI/.gemini/antigravity/scratch/student-task-manager/schema.sql) is also provided for manual database inspection.

---

### Step 3: Run the Spring Boot Backend
Open a terminal in VS Code (**Terminal > New Terminal**) and execute:

```bash
# Using Maven
mvn spring-boot:run
```

*Or if you prefer running from the IDE:*
- Open `src/main/java/com/studenttasks/StudentTaskManagerApplication.java`
- Click the **Run** or **Debug** button above the `main` method.

You should see Spring Boot startup logs ending with:
```
Tomcat started on port 8080 (http) with context path '/'
Started StudentTaskManagerApplication in X.XXX seconds
```

---

### Step 4: Run Automated Tests
To run the automated JUnit 5 and MockMvc test suite:
```powershell
mvn test
```
All 11 controller and service tests will execute with 0 failures and 0 errors:
- Task CRUD tests (Create, Read, Update, Delete)
- Form validation error response tests
- Status toggle tests (Pending ↔ Completed)
- Dashboard KPI & Productivity calculation tests
- Analytics velocity & dataset tests

---

### Step 5: Open the Website in Your Browser

Since the frontend is bundled in `src/main/resources/static/`, you can directly open:

👉 **[http://localhost:8080](http://localhost:8080)**

*(Alternatively, if you run the frontend with VS Code's **Live Server** at `http://127.0.0.1:5500/src/main/resources/static/index.html`, CORS is enabled so it connects to the backend at `http://localhost:8080` automatically!)*

---

## 📡 REST API Reference

All endpoints return JSON and accept JSON bodies.

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks (supports query params: `search`, `subject`, `priority`, `status`, `taskType`, `sortBy`, `sortDirection`) |
| `GET` | `/api/tasks/{id}` | Get task by ID |
| `POST` | `/api/tasks` | Create a new task (validated request body) |
| `PUT` | `/api/tasks/{id}` | Update existing task details |
| `PATCH` | `/api/tasks/{id}/status?status=COMPLETED` | Update task status |
| `PATCH` | `/api/tasks/{id}/toggle-complete` | Toggle between Completed and Pending |
| `DELETE` | `/api/tasks/{id}` | Permanently delete a task |
| `GET` | `/api/tasks/dashboard` | Get KPI metrics, urgent deadlines, and recent tasks |
| `GET` | `/api/tasks/analytics` | Get productivity score, completion rates, and chart datasets |
| `GET` | `/api/tasks/calendar?year=2026&month=8` | Get tasks for calendar month view |
| `GET` | `/api/tasks/upcoming?daysAhead=7` | Get urgent deadlines within next N days |
| `GET` | `/api/tasks/subjects` | Get list of distinct course/subject names |
| `POST` | `/api/tasks/seed` | Trigger sample data seeding |

### Sample JSON Request Body (`POST /api/tasks`):
```json
{
  "title": "Machine Learning Lab 3 - Neural Networks",
  "description": "Implement backpropagation algorithm and evaluate accuracy on MNIST dataset.",
  "subject": "Artificial Intelligence",
  "taskType": "LAB_REPORT",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-08-30",
  "dueTime": "23:59:00",
  "estimatedHours": 4.5,
  "tags": "Python, PyTorch, AI, NeuralNetworks"
}
```

---

## 🧩 Troubleshooting & Tips

- **Database Connection Refused**:
  Ensure MySQL service is started. On Windows, open PowerShell as Administrator and run `net start MySQL80` or start MySQL through the Services app.
- **Port 8080 in use**:
  Change `server.port=8081` in `application.properties` if another service is using port 8080.
- **Data Persistence**:
  Tasks are stored permanently in MySQL. When you restart the Spring Boot server, `spring.jpa.hibernate.ddl-auto=update` ensures existing tables and records remain intact.

---

## 📜 License
This project is licensed under the MIT License — feel free to use and customize it for your college coursework and projects!
