# 🌐 Hosting Guide - Student Task Manager

This guide covers the three best ways to host the **Student Task Manager**:
1. [📱 Host on Your Local Network (Access from Phone / Tablets on same Wi-Fi)](#option-1-local-network--wi-fi-access-instant)
2. [☁️ Deploy to Render Cloud (Free 24/7 Public Web Hosting)](#option-2-deploy-to-render-cloud-free-recommended)
3. [🚂 Deploy to Railway (Turnkey Cloud Hosting)](#option-3-deploy-to-railway)
4. [🐳 Host via Docker Compose (Any Cloud VPS / Server)](#option-4-docker-compose-vps-or-cloud-vm)

---

## Option 1: Local Network / Wi-Fi Access (Instant)

Since the backend is running on `0.0.0.0:8080`, any device connected to your local Wi-Fi (such as your phone, iPad, or roommate's laptop) can access the website right now.

1. Find your computer's local IP address:
   - **Your current IP is:** `10.11.106.219`
2. Ensure Windows Firewall permits incoming connections on port `8080` (or run in PowerShell as Administrator):
   ```powershell
   New-NetFirewallRule -DisplayName "Student Task Manager (8080)" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
   ```
3. Open your mobile browser (Chrome / Safari) on your phone connected to the same Wi-Fi:
   👉 **`http://10.11.106.219:8080`**

---

## Option 2: Deploy to Render Cloud (Free, Recommended)

[Render](https://render.com) offers free cloud hosting for Dockerized web services and databases. A complete [`render.yaml`](file:///C:/Users/HANSAM%20JOSHI/OneDrive/student-task-manager2/render.yaml) blueprint is pre-configured.

### Step 1: Push Project to GitHub
1. Open terminal in the project folder:
   ```powershell
   cd "C:\Users\HANSAM JOSHI\OneDrive\student-task-manager2"
   ```
2. Create a repository on [GitHub](https://github.com/new) named `student-task-manager`.
3. Push the code:
   ```powershell
   git remote add origin https://github.com/<your-username>/student-task-manager.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Sign up / log in to [Render](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository `student-task-manager`.
4. Render will detect [`render.yaml`](file:///C:/Users/HANSAM%20JOSHI/OneDrive/student-task-manager2/render.yaml) and automatically configure:
   - Spring Boot Web Service
   - Managed Database (`student-task-db`)
5. Click **Apply**.
6. Within a few minutes, your site will be live at:
   👉 `https://student-task-manager.onrender.com`

---

## Option 3: Deploy to Railway

[Railway](https://railway.app) allows one-click deployments of Spring Boot and MySQL:

1. Push your repository to GitHub (as in Step 1 above).
2. Go to [Railway](https://railway.app) and click **Start a New Project**.
3. Select **Deploy from GitHub repo** and choose `student-task-manager`.
4. In the Railway project canvas, click **+ New** > **Database** > **Add MySQL**.
5. Under your web service settings, configure the environment variables:
   - `SPRING_DATASOURCE_URL`: `${{MySQL.MYSQL_URL}}`
   - `SPRING_DATASOURCE_USERNAME`: `${{MySQL.MYSQLUSER}}`
   - `SPRING_DATASOURCE_PASSWORD`: `${{MySQL.MYSQLPASSWORD}}`
6. Click **Generate Domain** under Settings. Your app is live with SSL!

---

## Option 4: Docker Compose (VPS or Cloud VM)

If you have a Linux VPS (AWS EC2, DigitalOcean, Hetzner, Linode, etc.):

1. Clone or copy the folder onto your server.
2. Run:
   ```bash
   docker compose up -d --build
   ```
3. Both the Spring Boot application and MySQL container will start with health checks and persistent volume storage.
4. Visit `http://<your-server-ip>:8080`.
