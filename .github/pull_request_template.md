## 📋 Pull Request Summary

<!-- Provide a brief summary of what this PR accomplishes -->

**Branch Name**: `DAY#-INITIAL/TASK-NAME`  
**Assignee**: @MOHIT / @SAM / @VIJAY  
**Related Issue**: Closes #issue_number (if applicable)

### What does this PR do?
<!-- Example: Implements JWT-based authentication for login and signup -->



---

## 🔧 Changes Made

<!-- List all significant changes with checkboxes -->

- [ ] Added new files/components
- [ ] Modified existing functionality
- [ ] Fixed bugs or errors
- [ ] Updated documentation
- [ ] Refactored code for better performance/readability
- [ ] Added tests

### Detailed Change List:
<!-- Example:
- Created `app/api/auth/login/route.js` with JWT implementation
- Updated Prisma schema with Session model
- Added bcrypt for password hashing
- Created authentication middleware
-->

1. 
2. 
3. 

---

## 📸 Screenshots / Evidence

<!-- Add screenshots, GIFs, or console output to demonstrate your changes -->

### Before:
<!-- Screenshot or description of previous state -->


### After:
<!-- Screenshot or description of new state -->


### Console Output / Test Results:
```bash
# Example: Paste relevant terminal output, test results, or build logs


```

---

## ✅ Pre-Submission Checklist

<!-- Ensure all items are checked before requesting review -->

### Code Quality
- [ ] Code builds successfully (`npm run build`)
- [ ] No ESLint errors or warnings (`npm run lint`)
- [ ] Prettier formatting applied (pre-commit hook passed)
- [ ] TypeScript type checks pass (no `any` types without justification)
- [ ] No `console.log` statements in production code

### Testing & Validation
- [ ] Tested locally in development environment
- [ ] Verified all new/modified features work as expected
- [ ] No console errors or warnings in browser DevTools
- [ ] Database migrations run successfully (if applicable)
- [ ] Environment variables documented in `.env.example`

### Security & Best Practices
- [ ] No sensitive data (API keys, passwords, tokens) exposed
- [ ] Server-side secrets use correct variable naming (no `NEXT_PUBLIC_`)
- [ ] Input validation implemented where needed
- [ ] SQL injection / XSS vulnerabilities checked
- [ ] Dependencies updated (if applicable)

### Documentation & Review
- [ ] Code comments added for complex logic
- [ ] README.md updated (if workflow/setup changed)
- [ ] FOLDER-STRUCTURE.md updated (if files added/moved)
- [ ] Linked to corresponding issue (if exists)
- [ ] Self-reviewed code for obvious issues
- [ ] Requested review from at least one teammate

### Git Hygiene
- [ ] Commit messages follow convention (`feat:`, `fix:`, `chore:`, etc.)
- [ ] Branch follows naming convention (`DAY#-INITIAL/TASK-NAME`)
- [ ] No merge conflicts with target branch
- [ ] Branch is up-to-date with `main`

---

## 🧪 How to Test

<!-- Provide step-by-step instructions for reviewers to test your changes -->

1. **Setup:**
   ```bash
   git checkout DAY#-INITIAL/TASK-NAME
   npm install
   npm run db:generate
   ```

2. **Run Application:**
   ```bash
   npm run dev
   ```

3. **Test Steps:**
   - Navigate to `http://localhost:3000/...`
   - Click on...
   - Verify that...
   - Expected result: ...

4. **Edge Cases to Test:**
   - What happens if...
   - Try with invalid input...
   - Check with empty fields...

---

## 🤔 Questions for Reviewers

<!-- List any specific concerns or areas you want reviewers to focus on -->

- Is the authentication approach secure enough?
- Should we add more error handling here?
- Is the component structure following our conventions?
- Performance concerns with this implementation?

---

## 📦 Dependencies Added/Updated

<!-- List any new packages or version updates -->

| Package | Version | Purpose |
|---------|---------|---------|
| `bcrypt` | `^5.1.0` | Password hashing |
| `jsonwebtoken` | `^9.0.0` | JWT token generation |

---

## 🚀 Deployment Notes

<!-- Any special instructions for deployment -->

- [ ] Requires environment variables update
- [ ] Database migration needed: `npm run db:migrate`
- [ ] New secrets to add in GitHub Actions: `JWT_SECRET`
- [ ] Redis cache needs flushing
- [ ] No deployment concerns

---

## 📚 Additional Context

<!-- Any other information reviewers should know -->

- This PR is part of DAY # sprint work
- Follows design from wireframes: [Screenshot (1003).png]
- Implements requirement from assignment: [Concept-#]

---

## 🏷️ Labels

<!-- GitHub will auto-add based on branch name, or manually select: -->

- `feature` / `fix` / `chore` / `docs`
- `day-1` / `day-2` / `day-3` / `day-4` / `day-5`
- `frontend` / `backend` / `full-stack`
- `needs-review` / `ready-to-merge` / `work-in-progress`

---

**Reviewer Instructions:**  
Please review the code, test locally if possible, and leave comments on specific lines if improvements needed. Approve only if all checklist items are satisfied.

**For Urgent PRs:**  
If this is time-sensitive, mention `@MOHIT @SAM @VIJAY` for immediate attention.
