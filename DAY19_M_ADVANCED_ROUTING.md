# DAY 19 - MOHIT: Advanced Routing with Next.js App Router

## 🎯 Learning Objective
**2.25 Advanced Routing**: Implement public/protected routing, dynamic segments, middleware-based authentication, navigation with breadcrumbs, and custom error pages using Next.js 14+ App Router.

## 📋 Overview
Implemented a comprehensive routing system that:
- ✅ Public routes accessible to all users (/, /login, /about)
- ✅ Protected routes requiring authentication (/dashboard, /users, /tasks-overview)
- ✅ Dynamic routes with parameters (/users/[id])
- ✅ Middleware for route protection with JWT verification
- ✅ Navigation with active state indicators
- ✅ Breadcrumbs for improved navigation
- ✅ Custom 404 error page
- ✅ SEO metadata and optimization

## 🏗️ Architecture

### Route Structure
```
app/
├── page.jsx                  → Home (Public) ✅
├── layout.jsx                → Root layout with navigation
├── not-found.tsx             → Custom 404 page
├── login/
│   └── page.tsx              → Login (Public) ✅
├── about/
│   └── page.jsx              → About (Public) ✅
├── dashboard/
│   └── page.jsx              → Dashboard (Protected) 🔒
├── tasks-overview/
│   └── page.jsx              → Tasks (Protected) 🔒
└── users/
    ├── page.tsx              → User list (Protected) 🔒
    └── [id]/
        └── page.tsx          → User profile (Protected, Dynamic) 🔒

middleware.ts                 → Route protection logic
```

### Route Types

#### Public Routes (No Authentication Required)
- `/` - Home page with feature overview
- `/login` - Authentication page
- `/about` - About page
- `/api/auth/*` - Authentication API endpoints

#### Protected Routes (Authentication Required)
- `/dashboard` - Main dashboard
- `/users` - User listing page
- `/users/[id]` - Dynamic user profile pages
- `/tasks-overview` - Task management interface

## 🛡️ Middleware Protection

### Implementation
[middleware.ts](middleware.ts) handles authentication for all routes:

```typescript
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (pathname === '/' || pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Protect private routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/users')) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}
```

### Key Features
- ✅ JWT token verification
- ✅ Automatic redirect to login for unauthorized access
- ✅ Return URL preservation (redirect back after login)
- ✅ Invalid token cleanup
- ✅ Public route bypass

## 🔀 Dynamic Routes

### User Profile Pages
[app/users/[id]/page.tsx](app/users/[id]/page.tsx) demonstrates dynamic routing:

```typescript
interface UserPageProps {
  params: {
    id: string;
  };
}

export default function UserPage({ params }: UserPageProps) {
  const { id } = params;
  // Fetch and display user data based on id
}
```

**URLs:**
- `/users/1` → User with ID 1
- `/users/abc123` → User with ID abc123
- `/users/xyz789` → User with ID xyz789

### Benefits
- Single component handles infinite user profiles
- SEO-friendly URLs
- Type-safe parameter access
- Easy to extend with more dynamic segments

## 🧭 Navigation & Breadcrumbs

### Global Navigation
[app/layout.jsx](app/layout.jsx) provides persistent navigation:

```jsx
<nav className="bg-white shadow-sm">
  <Link href="/">Home</Link>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/users">Users</Link>
  <Link href="/tasks-overview">Tasks</Link>
  <Link href="/about">About</Link>
</nav>
```

**Features:**
- Active route highlighting
- Sticky navigation
- Responsive design
- Authentication state display
- Logout functionality

### Breadcrumbs
Implemented on user pages for improved navigation:

```jsx
<nav className="breadcrumbs">
  <Link href="/">Home</Link> /
  <Link href="/users">Users</Link> /
  <span>{user.name}</span>
</nav>
```

**Benefits:**
- Shows user's location in site hierarchy
- Quick navigation to parent pages
- Improves SEO (structured data)
- Better user experience

## 📄 Route Pages

### 1. Home Page
[app/page.jsx](app/page.jsx) - Public landing page

**Features:**
- Feature showcase grid
- Call-to-action buttons
- Gradient design
- Links to main sections

### 2. Login Page
[app/login/page.tsx](app/login/page.tsx) - Authentication

**Features:**
- Email/password form
- Quick login buttons (test accounts)
- Return URL handling
- Loading states
- Error messages
- Cookie-based token storage

**Quick Login Options:**
- John (john@example.com)
- Mohit (mohit@sprintlite.com)
- Sam (sam@sprintlite.com)
- Password: `password123` for all

### 3. User List Page
[app/users/page.tsx](app/users/page.tsx) - Protected

**Features:**
- Grid layout of all users
- Role badges
- Loading skeleton
- Error handling
- Links to individual profiles

### 4. User Profile Page
[app/users/[id]/page.tsx](app/users/[id]/page.tsx) - Protected, Dynamic

**Features:**
- Profile card with gradient header
- Avatar with initials
- User details grid
- Breadcrumb navigation
- 404 handling for invalid IDs
- Back button

### 5. Custom 404 Page
[app/not-found.tsx](app/not-found.tsx)

**Features:**
- Animated 404 text
- Error icon
- Helpful message
- Action buttons (Home, Dashboard)
- Popular pages links
- Gradient background

## 🔍 SEO & Metadata

### Root Layout Metadata
```jsx
<head>
  <title>SprintLite - Task Management</title>
  <meta name="description" content="Modern task management platform..." />
  <meta name="keywords" content="task management, Next.js, routing..." />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
```

### Dynamic Metadata (Future Enhancement)
```typescript
// In app/users/[id]/page.tsx
export async function generateMetadata({ params }) {
  const user = await fetchUser(params.id);
  return {
    title: `${user.name} - User Profile`,
    description: `View ${user.name}'s profile and activity`,
  };
}
```

### SEO Benefits
1. **Semantic HTML**: Proper heading hierarchy
2. **Breadcrumbs**: Structured navigation for search engines
3. **Clean URLs**: `/users/123` vs `/user?id=123`
4. **Fast Loading**: Server components and streaming
5. **Mobile Responsive**: Viewport meta tag

## 🧪 Testing Routes

### Manual Testing Flow

#### 1. Public Access
```bash
# Visit home page (no auth required)
http://localhost:3000/

# Visit login page
http://localhost:3000/login

# Visit about page
http://localhost:3000/about
```

#### 2. Protected Access (Redirect Test)
```bash
# Try accessing dashboard without login
http://localhost:3000/dashboard
# → Should redirect to /login?returnUrl=/dashboard
```

#### 3. Login and Access
```bash
# Login with test account
Email: john@example.com
Password: password123

# After login, should redirect to dashboard
http://localhost:3000/dashboard
# → Success! (authenticated)
```

#### 4. Dynamic Routes
```bash
# Visit different user profiles
http://localhost:3000/users/1
http://localhost:3000/users/user123
http://localhost:3000/users/xyz789

# Each renders different user data
```

#### 5. 404 Testing
```bash
# Visit non-existent route
http://localhost:3000/this-page-does-not-exist
# → Custom 404 page
```

#### 6. Logout and Re-test
```bash
# Click logout button
# Try accessing /dashboard again
# → Should redirect to /login
```

## 📊 Route Map

| Route | Type | Auth Required | Dynamic | Description |
|-------|------|---------------|---------|-------------|
| `/` | Public | ❌ | ❌ | Home page |
| `/login` | Public | ❌ | ❌ | Login page |
| `/about` | Public | ❌ | ❌ | About page |
| `/dashboard` | Protected | ✅ | ❌ | Main dashboard |
| `/users` | Protected | ✅ | ❌ | User list |
| `/users/[id]` | Protected | ✅ | ✅ | User profile |
| `/tasks-overview` | Protected | ✅ | ❌ | Task list |
| `/*` | Error | ❌ | ❌ | 404 page |

## 🎨 UI/UX Features

### Design System
- **Colors**: Purple-blue gradient theme
- **Shadows**: Consistent elevation system
- **Animations**: Smooth transitions
- **Responsive**: Mobile-first design

### Navigation States
- **Active**: Purple background with bold text
- **Hover**: Gray background
- **Default**: Gray text

### Loading States
- Skeleton loaders on user pages
- Button loading indicators
- Shimmer animations

### Error States
- Custom 404 page
- Error boundaries
- Helpful error messages
- Retry buttons

## 🚀 Performance Optimizations

### Server Components (Default)
Most pages are server components for optimal performance:
- Pre-rendered on server
- No JavaScript bundle for static content
- Faster initial load

### Client Components (When Needed)
Used only where necessary:
- `'use client'` for interactive features
- Login page (form handling)
- Layout (navigation state)
- User pages (API calls)

### Code Splitting
- Each route automatically code-split
- Dynamic imports for heavy components
- Reduced initial bundle size

## 🔒 Security Considerations

### 1. JWT Verification
- Server-side token validation
- Expired token handling
- Invalid token cleanup

### 2. Cookie Security
```javascript
Cookies.set('token', data.token, {
  expires: 1,        // 1 day
  secure: true,      // HTTPS only (production)
  sameSite: 'strict' // CSRF protection
});
```

### 3. Middleware Protection
- Runs before route rendering
- Server-side only (can't be bypassed)
- Protects API routes too

### 4. Return URL Validation
- Only allows internal redirects
- Prevents open redirect vulnerabilities

## 📝 Reflection

### SEO Advantages of Next.js App Router

#### 1. Server-Side Rendering
- Content available on first paint
- Search engines can crawl instantly
- Better indexing and ranking

#### 2. Dynamic Metadata
```typescript
export const metadata = {
  title: 'User Profile',
  description: 'View user information',
  openGraph: {
    title: 'User Profile',
    images: ['/og-image.jpg'],
  },
};
```

#### 3. Clean URLs
- `/users/123` is more SEO-friendly than `/user?id=123`
- Readable URLs improve click-through rates
- Better for sharing on social media

#### 4. Structured Data
Breadcrumbs can include JSON-LD for rich snippets:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

### How Breadcrumbs Improve Navigation

#### User Benefits
- Shows current location in hierarchy
- Quick access to parent pages
- Reduces back button usage
- Better mental model of site structure

#### SEO Benefits
- Google displays breadcrumbs in search results
- Improves site architecture understanding
- Better internal linking structure
- Lower bounce rates

#### Accessibility
- Screen reader navigation landmarks
- Keyboard navigation support
- Clear page hierarchy

### Route-Level Error Handling

#### 1. Not Found (404)
```tsx
// app/not-found.tsx
export default function NotFound() {
  return <div>Page not found</div>;
}
```

#### 2. Error Boundaries
```tsx
// app/error.tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### 3. Loading States
```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

#### 4. Custom Error Pages
- User-friendly messages
- Action buttons (retry, go home)
- Consistent branding
- Logging for debugging

### E-commerce Example: Dynamic Routing + SEO

**Product Pages:**
```
/products/[id]
→ /products/laptop-123
→ /products/phone-456
```

**Benefits:**
1. **Dynamic Metadata**
   ```typescript
   export async function generateMetadata({ params }) {
     const product = await fetchProduct(params.id);
     return {
       title: `${product.name} - $${product.price}`,
       description: product.description,
       openGraph: {
         images: [product.image],
       },
     };
   }
   ```

2. **Breadcrumbs**
   ```
   Home > Electronics > Laptops > MacBook Pro
   ```
   - Improves navigation
   - Shows in Google search results
   - Better site structure

3. **URL Structure**
   ```
   /products/electronics/laptops/macbook-pro-m3
   ```
   - Keywords in URL
   - Better than `/product?id=123`
   - More shareable

4. **Performance**
   - Static generation for popular products
   - ISR (Incremental Static Regeneration) for updates
   - Client-side navigation between products

5. **User Experience**
   - Instant navigation with prefetching
   - Back/forward button works correctly
   - Shareable URLs
   - Loading states during transitions

**Result:** Higher search rankings, better conversion rates, improved user satisfaction.

---

## 🎬 Video Demo Checklist

Your demo should show:

1. ✅ **Home Page Navigation**
   - Show navigation links
   - Explain public vs protected routes
   - Click different navigation items

2. ✅ **Protected Route Redirect**
   - Visit `/dashboard` while logged out
   - Demonstrate automatic redirect to `/login`
   - Show `returnUrl` in URL

3. ✅ **Login Flow**
   - Fill in credentials or use quick login
   - Show successful authentication
   - Demonstrate redirect back to intended page

4. ✅ **Dynamic Routes**
   - Visit `/users` to see user list
   - Click on a user (e.g., `/users/1`)
   - Show parameterized content
   - Try different user IDs

5. ✅ **Breadcrumbs**
   - Point out breadcrumb on user profile
   - Click breadcrumb links
   - Explain navigation hierarchy

6. ✅ **404 Page**
   - Visit `/nonexistent-page`
   - Show custom 404 design
   - Click action buttons

7. ✅ **Logout & Re-test**
   - Click logout button
   - Try accessing protected route again
   - Show redirect to login

8. ✅ **Metadata & SEO**
   - Show browser tab title changes
   - Explain metadata configuration
   - Discuss SEO benefits

## 💡 Creative Reflection

**Question:** "How can dynamic routing and metadata generation together improve user experience and SEO ranking for an app like an e-commerce site or dashboard?"

**Answer:**

### For E-commerce:
1. **Product Discovery**
   - Dynamic routes: `/products/[category]/[id]`
   - Each product gets unique URL with keywords
   - Google indexes every product individually

2. **Rich Search Results**
   ```typescript
   export async function generateMetadata({ params }) {
     const product = await getProduct(params.id);
     return {
       title: `${product.name} - $${product.price} | Store`,
       description: product.description,
       openGraph: {
         images: [product.image],
         price: product.price,
         availability: product.inStock ? 'in stock' : 'out of stock',
       },
     };
   }
   ```
   - Products show with images in search
   - Price and availability in snippets
   - Better click-through rates

3. **User Experience**
   - Shareable product links
   - Direct deep linking
   - Fast navigation with prefetching
   - Breadcrumbs: Home > Category > Subcategory > Product

### For Dashboards:
1. **Resource Management**
   - Dynamic routes: `/reports/[reportId]`, `/users/[userId]`
   - Direct links to specific resources
   - Bookmarkable dashboard states

2. **Performance**
   - Server-side authentication check (middleware)
   - Lazy load dashboard widgets
   - Prefetch on hover for instant navigation

3. **Analytics & Tracking**
   ```typescript
   // Track which pages users visit
   useEffect(() => {
     analytics.track('Page View', {
       route: pathname,
       userId: user.id,
     });
   }, [pathname]);
   ```

4. **SEO for Internal Search**
   - Even internal tools benefit from good metadata
   - Helps with browser history search
   - Better organization

**Key Takeaway:** Dynamic routing + metadata = Better discoverability (SEO) + Better experience (UX) = Higher engagement and conversion rates.

---

**Status**: ✅ Complete  
**Date**: January 2024  
**Next**: Advanced features (nested layouts, parallel routes, intercepting routes)
