# Task Manager

A full-stack task management web application built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Authentication** — Email/password signup, login, and password reset via Supabase Auth
- **Task CRUD** — Create, view, edit, and delete tasks with confirmation dialogs
- **Task Properties** — Title, description, priority (low/medium/high), due date, status (todo/in-progress/done)
- **Filtering & Sorting** — Filter by view (All, Today, Upcoming, Completed), status, priority; sort by due date or creation date
- **Responsive UI** — Mobile-first design with drawer navigation, bottom sheet form, and FAB for task creation
- **Optimistic Updates** — Instant UI feedback when toggling task completion
- **Row Level Security** — Each user can only access their own tasks

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS 3 |
| Date Utilities | date-fns 3 |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account and project

### 1. Clone and install

```bash
git clone <repo-url>
cd task-manager
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Find these values in your Supabase project under **Settings → API**.

### 3. Set up the database

In your Supabase project, open the **SQL Editor** and run the contents of [`database.sql`](./database.sql). This creates:

- `public.tasks` table with all required columns
- Indexes on `user_id`, `status`, `due_date`, and `created_at`
- Row Level Security policies (users see only their own tasks)
- An `updated_at` auto-update trigger

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` — sign up to get started.

## Database Schema

**Table: `public.tasks`**

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | — | References `auth.users`, cascade on delete |
| `title` | `text` | — | Required |
| `description` | `text` | `null` | Optional |
| `priority` | `text` | `'medium'` | `low` / `medium` / `high` |
| `due_date` | `date` | `null` | Optional deadline |
| `status` | `text` | `'todo'` | `todo` / `in_progress` / `done` |
| `created_at` | `timestamptz` | `now()` | |
| `updated_at` | `timestamptz` | `null` | Auto-updated on change |

## Project Structure

```
.
├── app/
│   ├── (auth)/           # Login & signup pages
│   ├── auth/callback/    # OAuth redirect handler
│   └── dashboard/        # Main app page
├── components/
│   ├── auth/             # LoginForm, SignupForm
│   ├── dashboard/        # Header, Sidebar, TaskCard, TaskForm, TaskList, TaskFilters
│   └── ui/               # ConfirmDialog, EmptyState, LoadingSkeleton, PriorityBadge
├── lib/
│   ├── supabase/         # Browser and server Supabase clients
│   ├── types.ts          # Shared TypeScript interfaces
│   ├── task-filters.ts   # Pure filtering/sorting utilities
│   └── auth-validation.ts# Form validation helpers
├── middleware.ts          # Auth-based route protection
└── database.sql           # Full database setup script
```

## Available Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

## Deployment

The app is ready to deploy on [Vercel](https://vercel.com). Set the two environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings before deploying.
