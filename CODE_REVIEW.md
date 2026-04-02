# Code Review: Task Manager

## Overall Score: 7.5/10

A decent portfolio project. Clean structure, proper TypeScript usage, thoughtful UI. But there are issues at various severity levels.

---

## What's Done Well

### 1. Project Structure
Clear layer separation:
- `lib/` -- utilities and clients
- `components/ui/` -- reusable UI components
- `components/dashboard/` and `components/auth/` -- business components
- `app/` -- Next.js App Router routing

### 2. TypeScript
Strict mode enabled, types extracted to a separate file (`lib/types.ts`), component props typed via interfaces. Correct approach.

### 3. Database Security
Row Level Security in `database.sql` is configured correctly. Each user sees only their own tasks. This is critically important.

### 4. Optimistic UI Updates
`handleToggleComplete` in `dashboard/page.tsx:124-143` updates UI instantly and rolls back on error. Proper UX pattern.

### 5. Middleware
Correctly protects routes and refreshes session via cookies.

---

## Critical Issues

### 1. Duplicated Filtering Logic (DRY Violation)

Task counting logic in `Sidebar.tsx:29-69` **fully duplicates** the filtering logic in `dashboard/page.tsx:76-122`. If the definition of "upcoming" or "today" changes, it needs updating in two places.

Moreover, the behavior **differs**: Sidebar filters out `done` tasks from the "Today" counter, but the dashboard page does not. This is likely a bug.

**Solution**: Extract filters to `lib/utils.ts` or create a `useTaskFilters` hook.

### 2. No Tests -- None at All

Zero tests. For a learning project this is okay, but for prompt engineering this is an important point: **a good prompt should require tests**. Minimum:
- Unit tests for filtering/sorting logic
- Integration tests for forms
- E2E test for the main flow (create/edit/delete task)

### 3. `handleDelete` Is Not Optimistic (`dashboard/page.tsx:145-155`)

Toggle has optimistic update, but delete does not. The task disappears from UI only after the server responds. Inconsistent UX.

---

## Medium Issues

### 4. Supabase Client Creation in Every Component

`useMemo(() => createClient(), [])` repeats in **4 components**: `LoginForm.tsx:15`, `SignupForm.tsx:15`, `TaskForm.tsx:49`, `dashboard/page.tsx:33`.

**Solution**: Create a React Context/Provider for Supabase, or use a singleton export from `client.ts`.

### 5. `fetchTasks` After Every Mutation (`TaskForm.tsx:101`)

After creating/editing a task, a full refetch of all tasks occurs. Better to update the specific task in state, or use a library like `react-query` / `swr`.

### 6. Inline SVGs Everywhere

Same SVG icons are copy-pasted throughout the code. Calendar icon appears in `TaskCard.tsx:106`, `Sidebar.tsx:36`; checkmark icon in `TaskCard.tsx:59`, `LoginForm.tsx:59`, `SignupForm.tsx:64`.

**Solution**: Extract icons to `components/ui/Icons.tsx` or use a library (`lucide-react`, `heroicons`).

### 7. Loading Spinner Duplicated

Same SVG spinner copy-pasted in `LoginForm.tsx:109-112`, `SignupForm.tsx:131-134`, `TaskForm.tsx:254-257`. Should be a `<Spinner />` component.

### 8. Error Banner Duplicated

Error display template (red block with icon) repeats in `LoginForm.tsx:93-99`, `LoginForm.tsx:169-175`, `SignupForm.tsx:117-123`, `TaskForm.tsx:229-234`. Should be `<ErrorBanner message={error} />`.

### 9. Sidebar Not Responsive

`Sidebar.tsx:75` has fixed width `w-56` without mobile adaptation. On small screens, sidebar will consume half the screen. Needs hamburger menu or `hidden md:flex` with a mobile drawer.

---

## Minor Issues

### 10. Redirect in Component Instead of Middleware (`app/page.tsx`)

Middleware already handles `/` for authenticated users (line 52). But for unauthenticated users, a whole component renders just to do a redirect. Better to handle this entirely in middleware.

### 11. Magic Number `.limit(100)` (`dashboard/page.tsx:55`)

100-task limit is hardcoded without pagination. If a user has 101+ tasks, some will silently disappear. Needs at least a "showing 100 of N tasks" indicator.

### 12. `inputClass` Duplicated

Input style string is copy-pasted between `LoginForm.tsx:51-52`, `SignupForm.tsx:56-57`, `TaskForm.tsx:115-116`. Should be in `lib/utils.ts` or as a CSS class.

### 13. Console.error in Production Code (`TaskForm.tsx:104`)

Production code should not have `console.error`. Either remove or replace with proper logging.

### 14. Unsafe Type Assertion (`TaskForm.tsx:108`)

```typescript
(err as { error_description?: string })?.error_description ?? JSON.stringify(err)
```

If `err` is not an object, this may produce unexpected results. Better to stick with `err instanceof Error ? err.message : 'Something went wrong'`.

---

## Scores by Category

| Category | Score | Comment |
|---|---|---|
| **Architecture** | 8/10 | Clean separation, proper App Router usage |
| **TypeScript** | 8/10 | Strict mode, good typing |
| **Security** | 8/10 | RLS, middleware, proper auth flow |
| **DRY / Code Cleanliness** | 5/10 | Much duplication (SVGs, spinners, filters, styles) |
| **UX Patterns** | 7/10 | Optimistic updates present but inconsistent |
| **Testing** | 0/10 | No tests |
| **Responsiveness** | 6/10 | TaskCard is adaptive, but Sidebar is not |
| **Error Handling** | 7/10 | Present but inconsistent |

---

## Prompt Engineering Takeaway

This code looks like a result of a prompt like *"create a task manager with Next.js and Supabase"* -- AI generated everything in one pass. The code works but has typical signs of one-shot generation:

1. **Copy-paste instead of abstractions** -- AI doesn't refactor unless asked
2. **No tests** -- AI doesn't write tests unless specified in the prompt
3. **Inconsistent patterns** -- optimistic vs non-optimistic, different filter logic
4. **No edge cases** -- pagination, mobile sidebar, rate limiting

**Prompt advice**: After generating base code, run a follow-up prompt: *"Review this code for DRY violations, missing tests, inconsistent patterns, and edge cases. Refactor and add tests."*
