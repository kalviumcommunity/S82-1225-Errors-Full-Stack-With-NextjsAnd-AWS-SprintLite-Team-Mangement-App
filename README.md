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

### Daily Report

## Day 1 - December 18, 2025

**What We Did Today:**
## MOHIT :-
1. **Set Up Database with Prisma**
   - Connected PostgreSQL database (Neon) to the project
   - Created database schema with User and Post models
   - Set up Prisma Client for database operations
   - Created helper functions to fetch and create users/posts

2. **Environment Configuration**
   - Created separate environment files for three environments:
     - `.env.development` - for local development
     - `.env.staging` - for testing before going live
     - `.env.production` - for live production use
   - Each environment has its own database URL and app URL
   - Installed `env-cmd` package to automatically load the right environment

3. **CI/CD Pipeline Setup**
   - Created GitHub Actions workflow that runs automatically when we push code
   - The pipeline does these checks:
     - Checks code for errors (linting)
     - Verifies TypeScript types are correct
     - Tests database connection
     - Builds the app for different environments
   - Automatic deployment to the right environment based on which branch we push to:
     - Push to `develop` branch → deploys to development
     - Push to `staging` branch → deploys to staging
     - Push to `main` branch → deploys to production

## SAM :-
4. What This Is :-
 - Static Site Generation (SSG)
 - Page is rendered once during build
 - Served as plain HTML afterwards

5. Why This Exists :-
 - Best performance
 - Zero runtime server cost
 - Ideal for marketing / info pages

# The About page uses static rendering because its content is not user-specific and rarely changes, allowing it to be generated once at build time for maximum performance.

## VIJAY :- 

6. What This Is :-
 - Server-Side Rendering (SSR)
 - Page is rendered on every request
 - Uses live database + session data

7. Why force-dynamic :- 
 - Disables caching
 - Ensures fresh data every refresh
 - Correct choice for dashboards

# The dashboard uses server-side rendering to ensure that authenticated users always see the most up-to-date task data tied to their session.

## MOHIT :- 

8. What This Is :-
 - Incremental Static Regeneration (ISR)
 - Page is static but updates periodically

9. What revalidate = 60 Means :-
 - Page is cached
 - Regenerated at most once every 60 seconds
 - Combines speed + freshness

10. Why This Page Exists :-
 - Team-wide stats
 - Does not need per-request freshness
 - Perfect hybrid use case

# The task overview page uses ISR to balance performance and data freshness by periodically revalidating static content.

##VIJAY :-
11. **Testing & Verification**
   - Created test scripts to verify database connection
   - Created verification scripts to check environment separation is working
   - Tested all three environments - everything working correctly!

**What This Means:**
We can now develop locally without worrying about breaking production
When we push code, it gets automatically tested and deployed
Different team members can work on different environments safely
Database is connected and ready to use

**Commands Added:**
npm run dev - Start development server
npm run verify:dev - Check development environment
npm run verify:staging - Check staging environment  
npm run verify:prod - Check production environment
npm run test:db - Test database connection
---

