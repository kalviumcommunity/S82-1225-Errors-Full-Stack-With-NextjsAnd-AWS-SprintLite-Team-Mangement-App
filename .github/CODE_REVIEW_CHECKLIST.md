# Code Review Checklist

Use this checklist when reviewing pull requests to ensure code quality, security, and maintainability.

---

## ✅ Code Quality & Standards

### Naming & Structure
- [ ] **Variable/function names are descriptive and follow conventions**
  - camelCase for variables/functions: `getUserData()`, `isAuthenticated`
  - PascalCase for components: `TaskCard`, `UserAvatar`
  - UPPERCASE for constants: `MAX_RETRIES`, `API_BASE_URL`
  - No single-letter names (except loop counters `i`, `j`)

- [ ] **File/folder structure follows project conventions**
  - Components in `components/` directory
  - API routes in `app/api/` directory
  - Utilities in `lib/` directory
  - Route groups used correctly: `(auth)`, `(main)`

- [ ] **Code is DRY (Don't Repeat Yourself)**
  - No duplicated logic that could be extracted into functions
  - Reusable components extracted properly
  - Common utilities in shared files

### Code Readability
- [ ] **Code is easy to understand without extensive comments**
  - Self-documenting code with clear intent
  - Complex logic broken into smaller functions
  - Magic numbers replaced with named constants

- [ ] **Comments are meaningful and necessary**
  - No obvious comments: ❌ `// increment i` 
  - Good comments explain **why**, not what: ✅ `// Retry 3 times to handle transient network errors`
  - Complex algorithms have explanation comments
  - TODOs include context: `// TODO(MOHIT): Add rate limiting after MVP launch`

- [ ] **Functions are small and single-purpose**
  - Each function does one thing well
  - Ideally < 50 lines per function
  - No deeply nested conditionals (max 3 levels)

---

## 🔒 Security & Data Safety

### Sensitive Data Protection
- [ ] **No hardcoded secrets or credentials**
  - No API keys, database URLs, passwords in code
  - All secrets use environment variables
  - `.env` files not committed (except `.env.example`)

- [ ] **Environment variables follow Next.js conventions**
  - Server-only secrets: `DATABASE_URL`, `JWT_SECRET` (no `NEXT_PUBLIC_`)
  - Client-safe variables: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ANALYTICS_ID`
  - All variables documented in `.env.example`

- [ ] **User input is validated and sanitized**
  - All form inputs validated (client + server-side)
  - SQL injection prevention (Prisma parameterized queries)
  - XSS protection (proper escaping/sanitization)
  - File uploads validated (type, size, content if applicable)

- [ ] **Authentication & authorization implemented correctly**
  - Protected routes check authentication
  - User permissions verified on server-side
  - JWTs/sessions properly secured (httpOnly, secure cookies)
  - No sensitive data in JWT payload

---

## 🧪 Functionality & Testing

### Local Verification
- [ ] **Reviewer tested changes locally**
  - Checked out the branch: `git checkout DAY#-INITIAL/TASK-NAME`
  - Installed dependencies: `npm install`
  - Application runs without errors: `npm run dev`
  - All new features work as described in PR

- [ ] **Edge cases tested**
  - Empty inputs / null values handled
  - Invalid data types handled gracefully
  - Loading states shown appropriately
  - Error states display user-friendly messages

- [ ] **No console errors or warnings**
  - Browser DevTools console clean
  - Terminal shows no unhandled errors
  - No React key warnings
  - No unhandled promise rejections

### Testing & Validation
- [ ] **Automated tests pass (if applicable)**
  - Unit tests for utilities/functions
  - Integration tests for API routes
  - Component tests for UI elements
  - E2E tests for critical user flows (login, task creation)

- [ ] **Database operations are safe**
  - Migrations run successfully: `npm run db:migrate`
  - No breaking schema changes without migration strategy
  - Indexes added for frequently queried fields
  - Cascade deletes configured properly

---

## 🚀 Performance & Best Practices

### Next.js Specific
- [ ] **Rendering strategy is appropriate**
  - Server Components used by default (no unnecessary `'use client'`)
  - Client Components only when needed (interactivity, browser APIs)
  - Static generation for pages that don't change (ISR if needed)
  - Server-side rendering for dynamic user-specific data

- [ ] **Data fetching optimized**
  - No N+1 queries (use Prisma `include` for relations)
  - Parallel data fetching where possible
  - Pagination implemented for large datasets
  - Caching strategy defined (Redis, SWR, React Query)

- [ ] **Images optimized**
  - Using Next.js `<Image>` component
  - Proper `width`, `height`, `alt` attributes
  - Lazy loading enabled for below-fold images
  - WebP/AVIF formats considered

### Code Performance
- [ ] **No obvious performance issues**
  - No unnecessary re-renders (React.memo if needed)
  - No expensive operations in render functions
  - Debouncing/throttling for frequent events (search, scroll)
  - Virtualization for long lists (react-window if needed)

- [ ] **Bundle size considerations**
  - Large libraries imported selectively (not entire library)
  - Dynamic imports for heavy components: `next/dynamic`
  - Tree-shaking enabled (ES6 imports)
  - No unused dependencies

---

## 📦 Dependencies & Configuration

### Package Management
- [ ] **Dependencies justified**
  - New packages have clear purpose
  - No duplicate packages (check if existing package can do the job)
  - Package versions are stable (not pre-release)
  - `package-lock.json` or `yarn.lock` updated

- [ ] **Security vulnerabilities checked**
  - Run `npm audit` to check for known vulnerabilities
  - High/critical vulnerabilities addressed
  - Outdated dependencies reviewed

### Configuration Files
- [ ] **Config files updated correctly**
  - `tsconfig.json` for TypeScript changes
  - `eslint.config.mjs` / `.eslintrc.json` for lint rules
  - `prisma/schema.prisma` for database changes
  - `next.config.ts` for Next.js settings

---

## 📖 Documentation & Git Hygiene

### Documentation
- [ ] **README updated if needed**
  - New setup steps documented
  - Environment variables added
  - New commands/scripts explained
  - Deployment instructions current

- [ ] **Code documentation adequate**
  - Complex functions have JSDoc comments
  - API routes document input/output schemas
  - Components document props with PropTypes or TypeScript
  - Database models have descriptive comments

### Git Best Practices
- [ ] **Commit messages follow convention**
  - Format: `type(scope): description`
  - Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`
  - Examples:
    - ✅ `feat(auth): implement JWT-based authentication`
    - ✅ `fix(tasks): resolve duplicate task creation bug`
    - ❌ `updated files` (too vague)
    - ❌ `WIP` (work in progress commits should be squashed)

- [ ] **Branch naming follows convention**
  - Pattern: `DAY#-INITIAL/TASK-NAME`
  - Example: `DAY4-M/PROJECT-STRUCTURE`
  - No generic names: `test`, `temp`, `branch1`

- [ ] **PR linked to issue (if applicable)**
  - Use `Closes #123` in PR description
  - Issue provides context for the change
  - Labels applied correctly

- [ ] **No merge conflicts**
  - Branch up-to-date with target branch
  - Conflicts resolved if any
  - Merge strategy clear (squash vs merge commit)

---

## 🚫 Anti-Patterns to Reject

### Red Flags (Request Changes)
- ❌ **Commented-out code blocks** (remove instead of commenting)
- ❌ **Large files (>500 lines)** without good reason
- ❌ **God objects/functions** doing too many things
- ❌ **Magic numbers** without explanation
- ❌ **console.log** statements in production code
- ❌ **Hardcoded values** that should be configurable
- ❌ **Type `any` in TypeScript** without justification
- ❌ **Deeply nested conditionals** (>3 levels)
- ❌ **Catching errors without handling** (empty catch blocks)
- ❌ **Direct DOM manipulation** in React (use refs properly)

---

## 📊 Review Decision Matrix

### ✅ **Approve** - When to approve:
- All critical checklist items passed
- Minor issues noted in comments but don't block merge
- Code improves codebase quality
- No security concerns
- Functionality verified locally

### 💬 **Comment** - When to leave comments:
- Suggestions for improvement (not blockers)
- Questions about design decisions
- Alternative approaches to consider
- Praise for good solutions

### 🔄 **Request Changes** - When to block:
- Security vulnerabilities
- Breaking changes without migration plan
- Tests failing or not passing locally
- Code doesn't match requirements
- Major performance issues
- Hard to maintain/understand code

---

## 🎯 Reviewer Responsibilities

### Before Reviewing
1. Understand the context (read linked issue/requirement)
2. Pull the branch and run locally
3. Check the changes in GitHub UI first (get overview)
4. Read PR description and test instructions

### During Review
1. Start with high-level architecture feedback
2. Then review detailed implementation
3. Test manually (don't just trust CI/CD)
4. Leave constructive, specific comments
5. Use suggestions feature for quick fixes

### After Reviewing
1. Follow up on questions from PR author
2. Re-review after changes made
3. Approve only when satisfied
4. Celebrate good work! 🎉

---

## 📝 Review Comment Templates

### Requesting Clarification
```
❓ **Question:** Why did we choose approach X over Y? 
Could you explain the trade-offs?
```

### Suggesting Improvement
```
💡 **Suggestion:** Consider extracting this logic into a separate utility function 
for better reusability. What do you think?
```

### Pointing Out Issue
```
⚠️ **Issue:** This could cause a race condition if two users update simultaneously. 
We should add optimistic locking or use transactions.
```

### Praising Good Work
```
👍 **Nice!** Great use of React Server Components here. This will improve 
initial page load significantly.
```

### Critical Security Concern
```
🚨 **Security:** This exposes the database URL to the client bundle. 
Must be changed before merge. Move to server-side API route.
```

---

## 🏁 Final Checklist Before Approval

- [ ] I understand what this PR does
- [ ] I tested the changes locally
- [ ] Code quality meets our standards
- [ ] No security concerns
- [ ] Documentation updated
- [ ] All my comments/questions addressed
- [ ] This PR makes the codebase better

---

**Remember:** Code review is not about finding fault - it's about **collaboration**, **learning**, and building **better software together**. Be kind, be constructive, and be thorough.
