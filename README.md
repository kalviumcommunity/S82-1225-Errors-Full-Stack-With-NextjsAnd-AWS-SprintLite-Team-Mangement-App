# SprintLite

## Overview

SprintLite is a lightweight task management web application designed to help small teams create, assign, and track tasks through a simple workflow. The project is built as a simulated industry-style team project, following clean architecture, defined roles, and a production-oriented tech stack.

The goal of SprintLite is not to replicate a full-scale enterprise tool like Jira, but to demonstrate **core engineering fundamentals**: frontend–backend integration, database design, caching, cloud deployment, and collaborative development practices.

---

## Key Objectives

* Build a real, usable web application
* Work as a team with defined responsibilities
* Use industry-relevant technologies mandated by the module
* Keep the system simple, understandable, and finishable

---

## Core Features (Version 1)

### Authentication

* User signup
* User login
* Session-based authentication

### Task Management

* Create tasks
* Assign tasks to users
* Update task status
* View all tasks in a centralized dashboard

### Task Workflow

Tasks move through three predefined states:

* Todo
* In Progress
* Done

### Dashboard

* Tasks grouped by status columns
* Clear visibility of task ownership and progress

---

## What Is Out of Scope

The following features are intentionally excluded from Version 1:

* Notifications
* Chat or comments
* Analytics and reports
* AI features
* File uploads

This ensures focus on core functionality and stability.

---

## Technology Stack

### Frontend

* Next.js (React-based framework)
* TypeScript
* Basic CSS / Tailwind CSS

### Backend

* Next.js API Routes
* REST-style APIs

### Database

* PostgreSQL (Primary persistent data store)

### Caching / Sessions

* Redis (Session storage and optional caching)

### Cloud & Deployment

* AWS EC2 (single instance deployment)
* Application, database, and Redis hosted on AWS

---

## System Architecture (High Level)

User → Next.js Frontend → API Routes → PostgreSQL
                                      ↘ Redis

* PostgreSQL stores users and tasks permanently
* Redis stores session data and short-lived cache

---

## Data Models

### User

* id (UUID)
* email (unique)
* password (hashed)
* createdAt

### Task

* id (UUID)
* title
* description
* assignedTo (user email)
* status (Todo | InProgress | Done)
* createdAt
* updatedAt

---

## API Endpoints

### Authentication

* POST /api/auth/login
* POST /api/auth/logout

### Tasks

* POST /api/tasks (create task)
* GET /api/tasks (fetch all tasks)
* PUT /api/tasks/:id (update task status)

---

## Folder Structure

/app
/login
page.tsx
/dashboard
page.tsx
/create-task
page.tsx

/api
/auth
login.ts
logout.ts
/tasks
index.ts
[id].ts

/prisma
schema.prisma

---

## Team Roles

* Full-Stack Developer: Architecture decisions, reviews, integration
* Frontend Developer(s): UI pages and API integration
* Backend Developer(s): API logic, database operations
* Testing & Documentation: Testing flows and maintaining documentation

---

## How to Run (High Level)

1. Clone the repository
2. Install dependencies
3. Configure environment variables (PostgreSQL, Redis)
4. Run database migrations
5. Start development server

---

## Conclusion

SprintLite demonstrates how a small team can design, build, and deploy a clean, cloud-hosted web application using industry-relevant tools while maintaining simplicity and clarity. The project emphasizes fundamentals over unnecessary complexity.

---

## UI Visualization Prompt (For Figma AI / Bolt / Design Tools)

"Design a clean, modern task management web application called SprintLite. The app should have a professional but minimal look. Use a light background with subtle shadows. The login page should be centered with simple input fields. The main dashboard should display three vertical columns labeled Todo, In Progress, and Done. Each column contains task cards showing task title, assigned user, and a status change button. Include a top navigation bar with the app name SprintLite and a Create Task button. The Create Task page should have a simple form with inputs for title, description, assigned user, and status. Overall style should feel like a lightweight version of Jira or Trello, clean, readable, and developer-focused."