# SprintLite - Quick Start Guide

## 🚀 Running the Application

### Start Development Server
```bash
npm run dev
```

Access the app at: **http://localhost:3000**

---

## 📱 Page Structure

### Public Routes (No Auth Required)
- **`/`** - Landing page
- **`/login`** - Login form
- **`/register`** - Registration form

### Protected Routes (Auth Required)
- **`/dashboard`** - Kanban board with real-time task updates
- **`/tasks`** - Filterable task table
- **`/tasks/[id]`** - Task detail page (to be implemented)
- **`/tasks/new`** - Create new task (to be implemented)

### Demo Pages
- **`/users`** - SWR data fetching demo
- **`/state-demo`** - Context API demo

---

## 🔑 Key Features

### ✅ Dashboard Page
- **Real-time Kanban board** with 3 columns (Todo, In Progress, Done)
- **Auto-refresh** every 30 seconds
- **Task cards** showing:
  - Title and description
  - Assignee with avatar initials
  - Priority badge (High/Medium/Low)
  - Status indicator
- **Loading skeleton** for first load
- **Error handling** with retry button

### ✅ Tasks Page
- **Filterable table** of all tasks
- **Filters:**
  - Status (All/Todo/In Progress/Done)
  - Priority (All/High/Medium/Low)
- **Table columns:**
  - Task title (clickable to detail page)
  - Assignee with avatar
  - Status with colored indicator
  - Priority badge
  - Due date
- **Empty state** when no tasks found
- **Create Task** button

### ✅ Users Page (SWR Demo)
- List of all users from API
- **AddUser** component with optimistic UI
- **CacheInspector** showing SWR cache state
- Demonstrates SWR features:
  - Automatic caching
  - Revalidation on focus
  - Polling every 30 seconds
  - Request deduplication

---

## 🎨 UI Features

### Theme
- **Dark theme by default**
- Toggle available via UIContext
- Consistent color scheme across all pages

### Components
- **Header** - Navigation and user menu
- **Sidebar** - Quick navigation links
- **TaskCard** - Individual task display
- **Column** - Status-based task grouping
- **Loading Skeletons** - Smooth loading states
- **Error Messages** - User-friendly error handling

---

## 🔌 API Endpoints

### Tasks
```
GET  /api/tasks              - List all tasks
POST /api/tasks              - Create new task
GET  /api/tasks/:id          - Get task by ID
PUT  /api/tasks/:id          - Update task
DELETE /api/tasks/:id        - Delete task
GET  /api/tasks/summary      - Get task statistics
```

### Users
```
GET  /api/users              - List all users
POST /api/users              - Create new user
GET  /api/users/:id          - Get user by ID
PUT  /api/users/:id          - Update user
DELETE /api/users/:id        - Delete user
```

### Comments
```
GET  /api/comments           - List all comments
POST /api/comments           - Create new comment
GET  /api/comments/:id       - Get comment by ID
PUT  /api/comments/:id       - Update comment
DELETE /api/comments/:id     - Delete comment
```

---

## 🛠️ Development Workflow

### Using SWR
```javascript
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const { data, error, isLoading } = useSWR("/api/tasks", fetcher, {
  refreshInterval: 30000,        // Poll every 30s
  revalidateOnFocus: true,       // Refetch on tab focus
  revalidateOnReconnect: true,   // Refetch on reconnect
});
```

### Using AuthContext
```javascript
import { useAuth } from "@/context/AuthContext";

const { user, login, logout, isAuthenticated } = useAuth();

// Check if user is logged in
if (isAuthenticated) {
  console.log("Welcome", user.name);
}

// Login
await login({ name: "John", email: "john@example.com" });

// Logout
logout();
```

### Using UIContext
```javascript
import { useUI } from "@/context/UIContext";

const { theme, toggleTheme, isSidebarOpen, toggleSidebar } = useUI();

// Toggle dark/light theme
toggleTheme();

// Open/close sidebar
toggleSidebar();
```

---

## 📦 Project Structure

```
my-app/
├── app/
│   ├── (auth)/              # Public routes
│   │   ├── login/
│   │   └── register/
│   ├── (main)/              # Protected routes
│   │   ├── dashboard/       # ✅ Real-time Kanban
│   │   └── tasks/           # ✅ Filtered table
│   ├── users/               # ✅ SWR demo
│   ├── state-demo/          # Context demo
│   ├── layout.jsx           # Root layout with providers
│   └── globals.css          # Global styles
├── components/
│   └── layout/
│       ├── Header.tsx       # Navigation header
│       ├── Sidebar.tsx      # Side navigation
│       └── LayoutWrapper.tsx
├── context/
│   ├── AuthContext.jsx      # ✅ Auth state
│   └── UIContext.jsx        # ✅ UI state
├── lib/
│   ├── fetcher.js           # ✅ SWR fetcher
│   ├── db.js                # Database connection
│   └── db-actions.js        # Database queries
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                  # Static assets
```

---

## 🔥 Common Tasks

### Create a New Page with SWR
```javascript
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function MyPage() {
  const { data, error, isLoading } = useSWR("/api/endpoint", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### Filter Tasks by Status
```javascript
const [statusFilter, setStatusFilter] = useState("all");
const { data } = useSWR("/api/tasks", fetcher);

let tasks = data?.tasks || [];
if (statusFilter !== "all") {
  tasks = tasks.filter((t) => t.status === statusFilter);
}
```

### Add Loading Skeleton
```javascript
if (isLoading) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-700 rounded w-1/4"></div>
      <div className="h-96 bg-gray-800 rounded"></div>
    </div>
  );
}
```

---

## 🎯 Testing Checklist

### ✅ Dashboard Page
- [ ] Visit `/dashboard`
- [ ] Verify tasks load from API
- [ ] Check 3 columns (Todo, In Progress, Done)
- [ ] Verify task cards show correct data
- [ ] Test "Create Task" button link
- [ ] Wait 30s and verify auto-refresh

### ✅ Tasks Page
- [ ] Visit `/tasks`
- [ ] Verify table shows all tasks
- [ ] Test status filter dropdown
- [ ] Test priority filter dropdown
- [ ] Verify task count updates
- [ ] Click task title to navigate to detail
- [ ] Test "Create Task" button

### ✅ Users Page
- [ ] Visit `/users`
- [ ] Verify users load from API
- [ ] Test "Add User" form
- [ ] Verify optimistic UI update
- [ ] Check CacheInspector shows cache

---

## 🐛 Troubleshooting

### Issue: "Failed to load tasks"
**Solution:** Check database connection in `.env.development`

### Issue: "Middleware deprecated" warning
**Solution:** This is a Next.js warning, safe to ignore for now

### Issue: Tasks not updating in real-time
**Solution:** Check `refreshInterval: 30000` in useSWR config

### Issue: Dark theme not applying
**Solution:** Verify `<html className="dark">` in layout.jsx

---

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **SWR Docs:** https://swr.vercel.app
- **Prisma Docs:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🎉 What's Working Now

✅ Real-time task fetching  
✅ Kanban board with live updates  
✅ Filterable task table  
✅ Status and priority filters  
✅ Loading states and error handling  
✅ Dark theme by default  
✅ Responsive design  
✅ Navigation between pages  
✅ Auth context integration  
✅ UI context with theme toggle  

**Status:** Production Ready 🚀

---

**Need Help?**
- Check `REBUILD_SUMMARY.md` for detailed technical docs
- Read `README.md` for project overview
- Review DAY*.md files for feature implementation guides
