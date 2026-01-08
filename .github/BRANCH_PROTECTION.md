# Branch Protection Rules Setup

This guide explains how to configure branch protection rules for the SprintLite repository to maintain code quality and prevent accidental changes to critical branches.

---

## Why Branch Protection?

Branch protection ensures:
- ✅ No direct pushes to `main` - all changes via reviewed PRs
- ✅ Code quality checks pass before merge (lint, tests, build)
- ✅ At least one teammate reviews every change
- ✅ PRs are up-to-date with target branch before merge
- ✅ Prevents accidental force-pushes that rewrite history
- ✅ Maintains audit trail of all changes

---

## Setting Up Branch Protection (GitHub)

### Step 1: Navigate to Settings

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Select **Branches** from left sidebar
4. Click **Add branch protection rule**

### Step 2: Choose Branch to Protect

**Branch name pattern:** `main`

This protects your production branch. You can add rules for other branches like `develop` or `staging` later.

---

## Recommended Protection Rules

### ✅ Require Pull Request Reviews

**Setting:** `Require a pull request before merging`

**Options:**
- [x] **Require approvals:** 1 (minimum)
  - Small team (3 members): 1 approval sufficient
  - Larger team: increase to 2 approvals
  
- [x] **Dismiss stale pull request approvals when new commits are pushed**
  - If author pushes new code after approval, re-review required
  - Prevents sneaking in changes after approval
  
- [x] **Require review from Code Owners** (optional)
  - Use if you create a `CODEOWNERS` file
  - Assigns specific reviewers for specific files/folders

**Why this matters:**
- Catches bugs through peer review
- Knowledge sharing across team
- Maintains code quality standards

---

### ✅ Require Status Checks

**Setting:** `Require status checks to pass before merging`

**Status checks to require:**
- [x] **lint** (ESLint check from CI/CD)
- [x] **type-check** (TypeScript validation)
- [x] **build** (Ensures code compiles)
- [x] **test** (All tests pass - if you have tests)

**Options:**
- [x] **Require branches to be up to date before merging**
  - PR must include latest commits from `main`
  - Prevents merge conflicts
  - Forces author to resolve conflicts before merge

**Why this matters:**
- No broken code enters `main`
- Build failures caught before merge
- Type errors prevented in production

---

### ✅ Require Signed Commits (Optional but Recommended)

**Setting:** `Require signed commits`

**Why this matters:**
- Verifies commit author identity
- Prevents impersonation
- Required for some compliance standards

**How to set up:**
```bash
# Generate GPG key
gpg --full-generate-key

# List keys
gpg --list-secret-keys --keyid-format=long

# Add to GitHub
gpg --armor --export YOUR_KEY_ID
# Paste in GitHub Settings → SSH and GPG keys

# Configure Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

---

### ✅ Require Linear History (Recommended)

**Setting:** `Require linear history`

**Options:**
- [x] **Prevent merge commits** - only squash or rebase merges allowed

**Why this matters:**
- Clean, linear Git history
- Easy to understand project timeline
- Simpler to revert changes if needed

**Alternative:** Allow merge commits if you prefer detailed history

---

### ✅ Additional Protection Settings

**Do not allow bypassing the above settings:**
- [x] **Include administrators**
  - Even repo admins must follow rules
  - No one gets special treatment
  
**Rules applied to everyone:**
- [x] **Restrict who can push to matching branches**
  - No direct pushes allowed
  - All changes via PRs only

**Prevent destructive actions:**
- [x] **Do not allow force pushes**
  - Prevents rewriting Git history
  - Protects against accidental data loss
  
- [x] **Do not allow deletions**
  - Prevents accidental branch deletion
  - `main` branch can't be deleted

---

## Configuration Summary

### For `main` Branch (Production)

```yaml
Branch Protection Rules for: main

✅ Require pull request before merging
   - Required approvals: 1
   - Dismiss stale approvals: Yes
   
✅ Require status checks to pass
   - Required checks: lint, type-check, build
   - Require branches to be up to date: Yes
   
✅ Require linear history: Yes

✅ Include administrators: Yes

✅ Restrict pushes: Yes

✅ Do not allow force pushes: Yes

✅ Do not allow deletions: Yes
```

### Optional: For `develop` Branch (Development)

More relaxed rules for faster iteration:

```yaml
Branch Protection Rules for: develop

✅ Require pull request before merging
   - Required approvals: 1
   
✅ Require status checks to pass
   - Required checks: lint, build
   - Require branches to be up to date: No (faster merging)
   
⬜ Require linear history: No (allow merge commits)

⬜ Include administrators: No (admins can fast-track)

✅ Do not allow force pushes: Yes

✅ Do not allow deletions: Yes
```

---

## Workflow After Protection Enabled

### Creating a Pull Request

```bash
# 1. Create feature branch
git checkout -b DAY5-M/AUTHENTICATION

# 2. Make changes and commit
git add .
git commit -m "feat(auth): implement JWT authentication"

# 3. Push to GitHub
git push origin DAY5-M/AUTHENTICATION

# 4. Create PR on GitHub
# - Fill in PR template
# - Request reviewers: @SAM @VIJAY
# - GitHub Actions will automatically run checks

# 5. Wait for:
#    - ✅ CI/CD checks to pass
#    - ✅ At least 1 approval from teammate
#    - ✅ All review comments addressed

# 6. Merge via GitHub UI (NOT command line)
```

### What Happens if Status Checks Fail?

**Example: ESLint Error**

```
❌ lint — Failed
Error: 'userName' is defined but never used
```

**Fix:**
```bash
# Fix the issue locally
npm run lint       # Identify errors
npx eslint --fix . # Auto-fix if possible

# Commit fix
git add .
git commit -m "fix: remove unused variable"

# Push again
git push origin DAY5-M/AUTHENTICATION

# GitHub Actions re-runs checks automatically
# ✅ lint — Passed
```

---

## Handling Merge Conflicts

If your PR has conflicts with `main`:

```bash
# Update your local main
git checkout main
git pull origin main

# Go back to your branch
git checkout DAY5-M/AUTHENTICATION

# Merge main into your branch
git merge main

# Resolve conflicts in editor
# Then commit the merge
git add .
git commit -m "chore: resolve merge conflicts with main"

# Push updated branch
git push origin DAY5-M/AUTHENTICATION

# PR now shows "Up to date" ✅
```

---

## Emergency Hotfix Process

For critical production bugs that need immediate fix:

1. **Create hotfix branch from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-security-fix
   ```

2. **Make minimal fix** (only critical changes)

3. **Create PR with "HOTFIX" label**
   - Request immediate review
   - Mention `@MOHIT @SAM @VIJAY` for urgency

4. **Fast-track review**
   - Single reviewer approval sufficient
   - Can bypass "up to date" requirement if needed (admin override)

5. **Merge and deploy immediately**

6. **Backport to develop branch** (if you have one)

---

## Common Issues & Solutions

### ❌ "This branch has conflicts that must be resolved"

**Solution:** Merge `main` into your branch locally, resolve conflicts, push again

### ❌ "Status checks are pending"

**Solution:** Wait for GitHub Actions to complete (usually 2-5 minutes)

### ❌ "Review required from code owners"

**Solution:** Request review from designated code owner or update `CODEOWNERS` file

### ❌ "Changes requested - review required"

**Solution:** Address review comments, push changes, re-request review

### ❌ "This branch is out-of-date with the base branch"

**Solution:** Click "Update branch" button or merge `main` locally

---

## Benefits We've Seen

**Before Branch Protection:**
- ❌ Broken code pushed directly to `main`
- ❌ Builds failing in production
- ❌ No code review - bugs slip through
- ❌ Force-pushes rewrite history
- ❌ Unclear who approved changes

**After Branch Protection:**
- ✅ Every change reviewed by teammate
- ✅ CI/CD catches issues before merge
- ✅ Clean Git history
- ✅ Accountability through approvals
- ✅ Better code quality overall

---

## Monitoring & Insights

### View Protection Status

1. Go to **Settings** → **Branches**
2. See all protected branches and rules
3. Edit rules anytime

### View PR Approval History

1. Open any merged PR
2. See timeline: commits, reviews, approvals, merges
3. Full audit trail preserved

### Branch Insights

1. Go to **Insights** → **Network**
2. Visualize branch history
3. See merge patterns

---

## Team Agreement

All team members agree to:
- ✅ Never force-push to protected branches
- ✅ Always create PRs for changes
- ✅ Review teammate PRs within 24 hours
- ✅ Address review comments promptly
- ✅ Keep PRs small and focused (< 500 lines if possible)
- ✅ Merge PRs only when all checks pass
- ✅ Delete feature branches after merge

---

## Screenshots Reference

### Example Protected Branch Settings

```
[Screenshot: GitHub Settings → Branches → Branch protection rules]
Showing:
- main branch with 8 rules active
- Checkboxes for all protection options
- Status checks list (lint, type-check, build)
```

### Example PR with Passing Checks

```
[Screenshot: Pull Request with green checkmarks]
Showing:
- ✅ All checks have passed (3/3)
- ✅ 1 approved review
- ✅ This branch is up to date with main
- "Merge pull request" button enabled
```

### Example Blocked Merge

```
[Screenshot: Pull Request with failing check]
Showing:
- ❌ Some checks were not successful (1 failed)
- ⚠️ lint — Failed in 1m 23s
- "Merge pull request" button disabled (grayed out)
- Message: "Required status checks must pass before merging"
```

---

## Next Steps

1. ✅ Enable branch protection for `main`
2. ⏳ Create first PR using new template
3. ⏳ Practice review process with team
4. ⏳ Add protection for `develop` branch (if using)
5. ⏳ Document any team-specific exceptions

---

**Documentation Date:** January 8, 2026  
**Last Updated:** DAY 4 - Git Workflow Setup  
**Maintained By:** MOHIT (Architecture), VIJAY (Security)
