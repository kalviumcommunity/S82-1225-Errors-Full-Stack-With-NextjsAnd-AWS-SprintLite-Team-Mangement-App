# DAY 20 - MOHIT : Client-Side Data Fetching with SWR

## 📋 Overview

This document details the implementation of client-side data fetching using **SWR (Stale-While-Revalidate)** in our Next.js application. SWR is a React Hooks library for data fetching that provides intelligent caching, automatic revalidation, and optimistic UI updates with minimal boilerplate.

**Date:** January 20, 2026  
**Objective:** Implement performant client-side data fetching with SWR, demonstrating caching, revalidation, optimistic UI, and cache inspection.

---

## 🚀 What is SWR?

**SWR** stands for **Stale-While-Revalidate**, an HTTP cache invalidation strategy popularized by [HTTP RFC 5861](https://tools.ietf.org/html/rfc5861).

### The SWR Strategy

```
1. Return STALE data from cache (instant)
2. Fetch FRESH data in background (revalidate)
3. Update UI with fresh data when ready
```

**Visual Flow:**

```
User Request → Check Cache
                ↓
           Has Cache? → YES → Return Stale Data (instant UI)
                ↓              ↓
                NO          Revalidate (background)
                ↓              ↓
           Fetch API → Update UI with Fresh Data
```

### Why SWR?

| Problem | Solution |
|---------|----------|
| Slow initial loads | Instant cache returns |
| Complex loading states | Automatic state management |
| Manual cache invalidation | Auto-revalidation on focus, reconnect |
| Prop drilling for data | Hooks-based, use anywhere |
| Race conditions | Built-in deduplication |
| Optimistic UI boilerplate | Simple `mutate()` API |

---

## 📁 Project Structure

```
my-app/
├── lib/
│   └── fetcher.js              # Centralized fetch function for SWR
│
├── app/
│   └── users/
│       ├── page.jsx            # Main users page with SWR
│       ├── AddUser.jsx         # Optimistic UI component
│       └── CacheInspector.jsx  # Cache visualization tool
```

---

## 🛠️ Implementation

### Step 1: Install SWR

```bash
npm install swr
```

**Package Info:**
- **Size:** ~5KB gzipped
- **Dependencies:** None (peer dependency: React)
- **TypeScript:** Built-in type definitions

---

### Step 2: Create Fetcher Function

**File: `lib/fetcher.js`**

```javascript
/**
 * Fetcher Function for SWR
 * 
 * This is a centralized fetching function used by SWR hooks throughout the app.
 */

export const fetcher = async (url) => {
  console.log(`🔄 Fetching: ${url}`);
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    error.status = res.status;
    error.info = await res.json().catch(() => ({}));
    console.error(`❌ Fetch failed for ${url}:`, error);
    throw error;
  }
  
  const data = await res.json();
  console.log(`✅ Fetched ${url}:`, data.length || "data", "items");
  
  return data;
};

/**
 * Fetcher with authentication token
 * Use this for protected API routes
 */
export const fetcherWithAuth = async (url) => {
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  });
  
  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};
```

**Why Centralize?**
- ✅ Single place to add auth headers
- ✅ Consistent error handling
- ✅ Easy to add logging, metrics
- ✅ Can switch to axios/other libraries easily

---

### Step 3: Users Page with SWR

**File: `app/users/page.jsx`**

```javascript
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function UsersPage() {
  // SWR Hook - fetches data with caching and revalidation
  const { data, error, isLoading, isValidating } = useSWR(
    "/api/users", 
    fetcher,
    {
      revalidateOnFocus: true,        // Refetch when tab regains focus
      revalidateOnReconnect: true,    // Refetch when connection is restored
      refreshInterval: 30000,          // Poll every 30 seconds
      dedupingInterval: 5000,         // Dedupe requests within 5 seconds
    }
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const users = data?.users || [];

  return (
    <main className="p-8">
      <h1>Users ({users.length})</h1>
      
      {isValidating && <p>🔄 Revalidating...</p>}
      
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} — {user.email}</li>
        ))}
      </ul>
    </main>
  );
}
```

**Key Features:**

1. **isLoading** - `true` only on first load (no cache)
2. **isValidating** - `true` when refetching in background
3. **data** - Returns cached data immediately, updates when revalidation completes
4. **error** - Catches fetch failures

---

### Step 4: SWR Configuration Options

```javascript
useSWR(key, fetcher, {
  // === Revalidation ===
  revalidateOnFocus: true,      // Refetch when window gains focus
  revalidateOnReconnect: true,  // Refetch when network reconnects
  refreshInterval: 0,           // Poll interval (0 = disabled)
  dedupingInterval: 2000,       // Dedupe identical requests within window
  
  // === Retry ===
  shouldRetryOnError: true,     // Retry on error
  errorRetryCount: 3,           // Max retry attempts
  errorRetryInterval: 5000,     // Delay between retries
  
  // === Performance ===
  revalidateIfStale: true,      // Revalidate even if cache is fresh
  suspense: false,              // Use React Suspense
  
  // === Callbacks ===
  onSuccess: (data, key, config) => {
    console.log("✅ Success:", data);
  },
  onError: (error, key) => {
    console.error("❌ Error:", error);
  },
});
```

---

### Step 5: Optimistic UI with Mutation

**File: `app/users/AddUser.jsx`**

```javascript
"use client";

import { useState } from "react";
import { mutate } from "swr";

export default function AddUser() {
  const [name, setName] = useState("");

  const handleAddUser = async () => {
    // 1. Optimistic update - Update UI immediately
    await mutate(
      "/api/users",
      async (currentData) => {
        const tempUser = {
          id: `temp-${Date.now()}`,
          name,
          email: "temp@user.com",
        };
        return {
          ...currentData,
          users: [...(currentData?.users || []), tempUser],
        };
      },
      false // Don't revalidate yet
    );

    // 2. Actual API call
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: "temp@user.com" }),
    });

    // 3. Revalidate to sync with server
    await mutate("/api/users");
    
    setName("");
  };

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
}
```

**Optimistic UI Flow:**

```
User clicks "Add" 
  ↓
Temp user added to cache (instant UI update)
  ↓
API request sent
  ↓
Server responds
  ↓
Revalidate cache (replace temp with real data)
  ↓
UI shows real ID from server
```

**If API Fails:**
- SWR automatically reverts the optimistic update
- UI returns to previous state
- Error handler can show notification

---

### Step 6: Cache Inspector

**File: `app/users/CacheInspector.jsx`**

```javascript
"use client";

import { useSWRConfig } from "swr";

export default function CacheInspector() {
  const { cache } = useSWRConfig();

  const inspectCache = () => {
    const keys = Array.from(cache.keys());
    console.log("📦 Cache Keys:", keys);

    keys.forEach((key) => {
      const value = cache.get(key);
      console.log(`Cache[${key}]:`, value);
    });
  };

  return (
    <button onClick={inspectCache}>
      🔍 Inspect Cache
    </button>
  );
}
```

**Console Output Example:**

```
📦 Cache Keys: ["/api/users", "/api/users/123"]

Cache[/api/users]: {
  data: { users: [...] },
  error: undefined,
  isValidating: false
}
```

---

## 📊 Cache Hits vs Cache Misses

### Cache Miss (First Load)

```javascript
// No cached data available
// Must fetch from API
// Shows loading state
// Takes full round-trip time

const { data, isLoading } = useSWR("/api/users", fetcher);
// isLoading = true
// data = undefined
// Makes API request
// ... wait for response ...
// isLoading = false, data = [...]
```

**Console Output:**
```
🔄 Fetching: /api/users
⏳ Cache Miss - Loading from API
✅ Fetched /api/users: 10 items
```

### Cache Hit (Subsequent Loads)

```javascript
// Cached data exists
// Returns immediately
// Revalidates in background

const { data, isLoading, isValidating } = useSWR("/api/users", fetcher);
// isLoading = false (cache exists)
// data = [...] (stale data from cache)
// isValidating = true (fetching fresh data)
// ... background fetch completes ...
// data = [...] (fresh data)
// isValidating = false
```

**Console Output:**
```
✅ Cache Hit - Returning stale data
🔄 Fetching: /api/users (background)
✅ Fetched /api/users: 10 items
📝 Updated cache with fresh data
```

### Visualization

```
First Load (Cache Miss):
User waits → API responds → Data displayed
|------------ 500ms -----------|

Second Load (Cache Hit):
Instant display → Background fetch → Silent update
|-- 0ms --|     |--- 500ms ---|
```

**Performance Gain:** User sees data **instantly** instead of waiting 500ms

---

## 🔄 Revalidation Strategies

### 1. Revalidate on Focus

**When:** User switches back to the tab

```javascript
useSWR("/api/users", fetcher, {
  revalidateOnFocus: true
});
```

**Use Case:** News feed, notifications, real-time dashboards

**Demo:**
1. Load the users page
2. Switch to another tab
3. Switch back
4. Watch console: "🔄 Revalidating on focus"

---

### 2. Revalidate on Reconnect

**When:** Network connection restored

```javascript
useSWR("/api/users", fetcher, {
  revalidateOnReconnect: true
});
```

**Use Case:** Mobile apps, offline-first apps

**Demo:**
1. Load the page
2. Turn off Wi-Fi
3. Turn Wi-Fi back on
4. Watch console: "🔄 Revalidating on reconnect"

---

### 3. Interval Polling

**When:** Every N milliseconds

```javascript
useSWR("/api/users", fetcher, {
  refreshInterval: 10000 // 10 seconds
});
```

**Use Case:** Live data (stock prices, sports scores)

**Demo:**
1. Load the page
2. Wait 10 seconds
3. Watch console: "🔄 Polling refresh"

---

### 4. Manual Revalidation

**When:** Triggered programmatically

```javascript
import { mutate } from "swr";

// Revalidate specific key
mutate("/api/users");

// Revalidate all keys matching pattern
mutate((key) => key.startsWith("/api/"));
```

**Use Case:** After form submission, user action

---

## 🎯 SWR Key Concept

The **key** is how SWR identifies cached data.

### Static Keys

```javascript
useSWR("/api/users", fetcher);
```

Key = `"/api/users"`

### Dynamic Keys

```javascript
const userId = "123";
useSWR(`/api/users/${userId}`, fetcher);
```

Key = `"/api/users/123"`

### Conditional Fetching

```javascript
// Only fetch if userId exists
useSWR(userId ? `/api/users/${userId}` : null, fetcher);
```

If key is `null`, SWR **pauses** fetching.

### Array Keys (with Parameters)

```javascript
useSWR(["/api/users", page, limit], ([url, page, limit]) => {
  return fetcher(`${url}?page=${page}&limit=${limit}`);
});
```

Key = `["/api/users", 1, 10]`

---

## ⚡ Performance Optimizations

### 1. Deduplication

Multiple components using the same key = **1 network request**

```javascript
// ComponentA.jsx
useSWR("/api/users", fetcher);

// ComponentB.jsx
useSWR("/api/users", fetcher); // Shares cache!
```

Within `dedupingInterval` (default 2s), only **1 fetch** occurs.

---

### 2. Prefetching

Fetch data before user needs it:

```javascript
import { mutate } from "swr";

// Prefetch on hover
<Link 
  href="/users/123"
  onMouseEnter={() => mutate("/api/users/123")}
>
  View User
</Link>
```

---

### 3. Dependent Queries

Fetch data sequentially:

```javascript
// Fetch user first
const { data: user } = useSWR("/api/user", fetcher);

// Then fetch posts (only if user exists)
const { data: posts } = useSWR(
  user ? `/api/posts?userId=${user.id}` : null,
  fetcher
);
```

---

## 🛡️ Error Handling & Retry Logic

### Basic Error Handling

```javascript
const { data, error } = useSWR("/api/users", fetcher);

if (error) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <p>Status: {error.status}</p>
      <button onClick={() => mutate("/api/users")}>Retry</button>
    </div>
  );
}
```

### Advanced Retry Configuration

```javascript
useSWR("/api/users", fetcher, {
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Don't retry on 404
    if (error.status === 404) return;

    // Max 3 retries
    if (retryCount >= 3) return;

    // Exponential backoff
    const delay = Math.min(1000 * 2 ** retryCount, 30000);
    
    setTimeout(() => {
      revalidate({ retryCount: retryCount + 1 });
    }, delay);
  },
});
```

**Retry Schedule:**
- 1st retry: 1s delay
- 2nd retry: 2s delay  
- 3rd retry: 4s delay
- Stop after 3 attempts

---

## 📈 SWR vs Fetch API Comparison

| Feature | SWR | Fetch API |
|---------|-----|-----------|
| **Caching** | ✅ Automatic | ❌ Manual (useState) |
| **Revalidation** | ✅ Built-in (focus, reconnect, polling) | ❌ Manual timers |
| **Loading States** | ✅ `isLoading`, `isValidating` | ❌ Manual state management |
| **Error Handling** | ✅ `error` state, retry logic | ❌ Try/catch everywhere |
| **Optimistic UI** | ✅ `mutate()` API | ⚠️ Complex manual logic |
| **Deduplication** | ✅ Automatic | ❌ Must implement |
| **Race Conditions** | ✅ Handled | ⚠️ Must handle manually |
| **Bundle Size** | ~5KB | 0KB (native) |
| **Boilerplate** | Low | High |

### Code Comparison

**Fetch API (Manual):**

```javascript
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // No caching, no revalidation, no deduplication
  // Must handle focus/reconnect manually
  // Race condition protection needed
}
```

**SWR:**

```javascript
function UsersPage() {
  const { data, error, isLoading } = useSWR("/api/users", fetcher);
  
  // Automatic caching ✅
  // Auto-revalidation ✅
  // Deduplication ✅
  // No race conditions ✅
}
```

**Lines of Code:**
- Fetch: ~25 lines
- SWR: ~1 line

---

## 🎓 Real-World Use Cases

### When to Use SWR

#### ✅ Perfect For:

1. **Dashboards** - Auto-refresh data on focus
2. **Social Feeds** - Instant stale content, fresh in background
3. **User Profiles** - Cache user data across navigation
4. **Search Results** - Dedupe rapid typing
5. **Live Data** - Poll for updates (stock prices, scores)

#### ❌ Not Ideal For:

1. **Server Components** - Use Next.js fetch with cache
2. **One-time Fetches** - Just use fetch()
3. **File Uploads** - Use FormData + fetch
4. **WebSocket Data** - Use native WebSocket or Socket.io

---

### Example: E-commerce Product Page

```javascript
function ProductPage({ productId }) {
  // Cache product data
  const { data: product } = useSWR(`/api/products/${productId}`, fetcher);
  
  // Cache user cart (revalidate on focus)
  const { data: cart } = useSWR("/api/cart", fetcher, {
    revalidateOnFocus: true
  });
  
  // Cache reviews (poll for new reviews)
  const { data: reviews } = useSWR(`/api/reviews/${productId}`, fetcher, {
    refreshInterval: 30000
  });

  // Optimistic "Add to Cart"
  const addToCart = async () => {
    await mutate("/api/cart", [...cart, product], false);
    await fetch("/api/cart", { method: "POST", body: JSON.stringify(product) });
    await mutate("/api/cart");
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={addToCart}>Add to Cart</button>
      <Reviews data={reviews} />
    </div>
  );
}
```

**Benefits:**
- Product data cached across navigation
- Cart updates instantly (optimistic UI)
- Reviews auto-refresh every 30s
- Switching tabs updates cart (revalidateOnFocus)

---

## 🔬 Stale-While-Revalidate Trade-offs

### ✅ Advantages

1. **Instant UI** - User sees data immediately (0ms perceived load time)
2. **Always Fresh** - Background updates ensure data is current
3. **Better UX** - No loading spinners for cached routes
4. **Resilient** - Works offline with stale data
5. **Simple Code** - Less boilerplate than manual caching

### ⚠️ Potential Confusion

#### 1. Stale Data Displayed First

**Scenario:** Stock price app

```javascript
useSWR("/api/stock/AAPL", fetcher);
```

User sees: `$150` (cached from 5 minutes ago)  
Reality: `$155` (current price)

**Problem:** User might make decisions on outdated data

**Solution:**
- Show "Last updated: 5 min ago"
- Add visual indicator during revalidation
- Use `refreshInterval` for critical data

```javascript
const { data, isValidating } = useSWR("/api/stock/AAPL", fetcher, {
  refreshInterval: 5000 // 5 seconds
});

return (
  <div>
    <h1>${data.price}</h1>
    {isValidating && <span>🔄 Updating...</span>}
  </div>
);
```

---

#### 2. Optimistic UI Failure

**Scenario:** Adding a user fails

```javascript
// User sees new item immediately
await mutate("/api/users", [...users, newUser], false);

// API fails
await fetch("/api/users", { method: "POST" }); // ❌ 500 Error

// Item disappears (revalidation)
await mutate("/api/users");
```

**Problem:** User sees item added, then it vanishes

**Solution:**
- Show toast notification on error
- Add loading indicator during API call
- Highlight optimistic items differently

```javascript
const addUser = async () => {
  try {
    // Optimistic update
    await mutate("/api/users", [...users, { ...newUser, _optimistic: true }], false);
    
    // API call
    const res = await fetch("/api/users", { method: "POST", body: JSON.stringify(newUser) });
    
    if (!res.ok) throw new Error("Failed to add user");
    
    // Success - revalidate
    await mutate("/api/users");
    toast.success("User added!");
  } catch (error) {
    // Error - revert optimistic update
    await mutate("/api/users");
    toast.error("Failed to add user");
  }
};
```

---

#### 3. Multiple Tabs Conflict

**Scenario:** User opens 2 tabs

- Tab A: User updates name to "Alice"
- Tab B: Still shows cached "Bob"
- Tab B: User switches to it (revalidateOnFocus)
- Tab B: Shows "Alice" (confusing if user expected "Bob")

**Solution:**
- Document that revalidateOnFocus updates data
- Add visual indicator: "Data updated"
- Use `revalidateOnFocus: false` if consistency critical

---

## 🎯 When Stale-While-Revalidate Shines

### Perfect Use Cases:

1. **Social Media Feeds**
   - Old posts shown instantly
   - New posts load in background
   - UX: Users scroll while fresh data loads

2. **User Profiles**
   - Cached bio, avatar shown immediately
   - Fresh data replaces silently
   - UX: No waiting for profile to load

3. **Search Results**
   - Previous results shown while new query runs
   - UX: Feels instant

4. **Dashboard Widgets**
   - Yesterday's metrics shown first
   - Today's metrics replace them
   - UX: No blank dashboard

---

### Avoid For:

1. **Financial Transactions**
   - Stale account balance = bad decisions
   - Solution: Use `revalidateIfStale: false` or server-side fetch

2. **Authentication State**
   - Stale "logged in" status = security issue
   - Solution: Check token expiry, not just cache

3. **Form Submissions**
   - Don't cache POST requests
   - Solution: Use fetch() directly, then `mutate()` related data

---

## 📹 Video Demo Script

### Part 1: SWR Basics (2 minutes)

1. **Load Users Page**
   - Open `/users`
   - Point to: "10 users loaded"
   - Open console: `🔄 Fetching: /api/users` (Cache Miss)

2. **Cache Hit**
   - Refresh page
   - Show: Users appear instantly
   - Console: `✅ Cache Hit - Returning stale data`
   - Console: `🔄 Fetching: /api/users (background)`

3. **Revalidate on Focus**
   - Switch to another tab
   - Switch back
   - Console: `🔄 Revalidating on focus`
   - Show: Top-right indicator "Revalidating..."

---

### Part 2: Optimistic UI (2 minutes)

1. **Add User**
   - Type name: "John Doe"
   - Type email: "john@example.com"
   - Click "Add User"
   - Show: User appears **instantly** at bottom of list
   - Console: `🚀 Optimistic UI - Adding temporary user`

2. **Server Sync**
   - Wait 1 second
   - Console: `📡 Sending POST request...`
   - Console: `✅ User added successfully`
   - Console: `🔄 Revalidating cache with server data`
   - Show: Temp ID replaced with real ID

3. **Error Handling**
   - Disconnect Wi-Fi
   - Try adding user
   - Show: User disappears after error
   - Alert: "Failed to add user"

---

### Part 3: Cache Inspector (1 minute)

1. **Inspect Cache**
   - Click "Inspect Cache"
   - Show: 1 cache entry for `/api/users`
   - Show: "✅ Has Data"
   - Console: `📦 Cache Keys: ["/api/users"]`

2. **Clear Cache**
   - Click "Clear Cache"
   - Console: `❌ Deleted cache key: /api/users`
   - Refresh page
   - Console: `⏳ Cache Miss - Loading from API`

---

### Part 4: Revalidation Demo (1 minute)

1. **Polling**
   - Load page
   - Wait 30 seconds
   - Console: `🔄 Polling refresh (interval)`
   - Explain: "Data auto-updates every 30s"

2. **Focus Revalidation**
   - Open another tab (e.g., Twitter)
   - Wait 5 seconds
   - Come back to users page
   - Console: `🔄 Revalidating on focus`
   - Explain: "SWR ensures data is fresh when you return"

---

### Part 5: Code Walkthrough (2 minutes)

1. **lib/fetcher.js**
   - Show: Simple fetch wrapper
   - Highlight: Error handling, logging

2. **app/users/page.jsx**
   - Show: `useSWR("/api/users", fetcher)`
   - Highlight: `isLoading`, `isValidating`, `error`
   - Highlight: Configuration options

3. **app/users/AddUser.jsx**
   - Show: `mutate()` with optimistic update
   - Highlight: 3-step flow (optimistic → API → revalidate)

4. **app/users/CacheInspector.jsx**
   - Show: `useSWRConfig().cache`
   - Highlight: Cache introspection

---

### Closing Reflection (1 minute)

**Question:** "In what real-world scenario could stale-while-revalidate improve user experience — and when might it cause confusion if misused?"

**Answer:**

"**Improved UX:** In a social media feed like Twitter, stale-while-revalidate is perfect. When you open the app, you instantly see cached tweets from your last visit — no blank screen or loading spinner. In the background, SWR fetches new tweets and seamlessly adds them to the top of your feed. This feels **fast and responsive**, even on slow networks.

**Potential Confusion:** However, in a banking app, stale-while-revalidate could be dangerous. Imagine you check your account balance and see $500 (cached from yesterday). You make a purchase decision based on that. But when the background revalidation completes, your actual balance is $50 — you're overdrawn! This creates confusion and potentially financial issues.

**The Trade-off:** Stale-while-revalidate prioritizes **perceived performance** over **immediate accuracy**. Use it for non-critical, frequently-changing data where users tolerate brief inconsistencies. Avoid it for financial data, authentication states, or any scenario where stale data could lead to wrong decisions.

**Best Practice:** Always show a visual indicator (like 'Last updated: 2 minutes ago') when displaying cached data, so users understand they're seeing slightly old information while fresh data loads."

---

## 🏆 Key Learnings

### 1. SWR Key = Cache Identity

```javascript
useSWR("/api/users", fetcher);           // Key: "/api/users"
useSWR(`/api/users/${id}`, fetcher);     // Key: "/api/users/123"
useSWR(id ? `/api/users/${id}` : null, fetcher); // Key: null (no fetch)
```

Every unique key has its own cache entry.

---

### 2. Optimistic UI Pattern

```javascript
// 1. Update cache immediately (no network)
await mutate(key, optimisticData, false);

// 2. Call API (background)
await fetch(url, { method: "POST", body });

// 3. Sync cache with server (revalidate)
await mutate(key);
```

**Result:** UI feels instant, syncs with server when ready.

---

### 3. Revalidation Strategies

| Strategy | When | Use Case |
|----------|------|----------|
| `revalidateOnFocus` | Tab gains focus | Dashboards, feeds |
| `revalidateOnReconnect` | Network restored | Offline apps |
| `refreshInterval` | Every N ms | Live data |
| Manual `mutate()` | Programmatic | After mutations |

---

### 4. Cache Hit vs Miss

- **Cache Hit:** Data returned in **0ms**, revalidates in background
- **Cache Miss:** Data fetched from API, takes full round-trip time

**Optimization:** Prefetch data on hover/mount to avoid cache misses.

---

### 5. Error Handling

```javascript
const { data, error } = useSWR(key, fetcher, {
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Custom retry logic
    if (error.status === 404) return; // Don't retry 404s
    if (retryCount >= 3) return;       // Max 3 retries
    setTimeout(() => revalidate({ retryCount }), 2000);
  },
});

if (error) {
  // Show error UI
  return <ErrorBoundary error={error} />;
}
```

---

## 🆚 SWR vs Other Solutions

### SWR vs React Query

| Feature | SWR | React Query |
|---------|-----|-------------|
| Bundle Size | ~5KB | ~13KB |
| Learning Curve | Easy | Medium |
| Mutations | Simple | Advanced |
| DevTools | Basic | Excellent |
| Offline Support | ✅ | ✅ |
| Infinite Queries | ✅ | ✅ |
| Best For | Simple data fetching | Complex data management |

**Choose SWR if:** You want simplicity, small bundle size  
**Choose React Query if:** You need advanced features, DevTools

---

### SWR vs Redux Toolkit Query (RTK Query)

| Feature | SWR | RTK Query |
|---------|-----|------------|
| Redux Integration | ❌ | ✅ |
| Auto-generated Hooks | ❌ | ✅ |
| Cache Invalidation | Manual | Tags system |
| Setup Complexity | Low | Medium |
| Best For | Non-Redux apps | Redux apps |

---

## 🚀 Next Steps

### Phase 1: Current Implementation ✅
- [x] Install SWR
- [x] Create fetcher helper
- [x] Implement users page with SWR
- [x] Add optimistic UI (AddUser)
- [x] Cache inspector
- [x] Revalidation configuration
- [x] Documentation

### Phase 2: Advanced Features
- [ ] **Error Boundaries** - Catch render errors
- [ ] **Pagination** - `useSWRInfinite` for infinite scroll
- [ ] **Prefetching** - Hover/mount prefetch
- [ ] **Mutations** - Full CRUD operations
- [ ] **Global Configuration** - SWRConfig provider

### Phase 3: Performance
- [ ] **Middleware** - Custom cache logic
- [ ] **Suspense Mode** - React Suspense integration
- [ ] **Immutable Mode** - Optimize large datasets
- [ ] **Focus Manager** - Custom focus detection

---

## 📚 Resources

### Official Documentation
- [SWR Official Docs](https://swr.vercel.app/)
- [SWR GitHub](https://github.com/vercel/swr)
- [Vercel Blog: SWR](https://vercel.com/blog/swr)

### Related Concepts
- [HTTP RFC 5861 (Stale-While-Revalidate)](https://tools.ietf.org/html/rfc5861)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

### Alternatives
- [React Query](https://tanstack.com/query)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Apollo Client](https://www.apollographql.com/docs/react/) (GraphQL)

---

## 🧪 Testing

### Run Dev Server
```bash
npm run dev
```

### Visit Demo Page
```
http://localhost:3000/users
```

### Test Scenarios

1. **Cache Miss** - First load, see loading skeleton
2. **Cache Hit** - Refresh, see instant data
3. **Optimistic UI** - Add user, see instant update
4. **Error Handling** - Disconnect network, see error
5. **Revalidation** - Switch tabs, see background fetch
6. **Polling** - Wait 30s, see auto-refresh
7. **Cache Inspector** - Click button, see cache keys

---

## 🎓 Reflection Answers

### Q: What's one real-world scenario where stale-while-revalidate improves UX?

**A:** News aggregator app (e.g., Reddit, Hacker News)

When you open the app:
1. **Instant:** See cached headlines from last visit (0ms)
2. **Background:** Fetch fresh headlines
3. **Silent Update:** New headlines appear at top

**Result:** App feels instant, always shows recent content, no loading spinners.

---

### Q: When might it cause confusion if misused?

**A:** Real-time collaboration tool (e.g., Google Docs)

If two users edit the same document:
1. User A sees cached version from 5 minutes ago
2. User A makes edits based on old content
3. Background revalidation loads User B's changes
4. User A's edits conflict with User B's changes
5. Data loss or merge conflict

**Solution:** Don't use stale data for real-time collaboration. Use WebSockets instead.

---

**End of Documentation**

*Last Updated: January 20, 2026*
