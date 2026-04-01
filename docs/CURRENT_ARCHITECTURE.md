# Current Architecture

This document reflects the codebase as it exists now, not the older pre-refactor layout.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- MongoDB with Mongoose models
- Pusher for realtime leave, user, and dashboard updates
- Vitest for focused unit tests

## Top-Level Runtime Model

The app is a single Next.js project that contains both UI and backend APIs:

1. Client pages live under `src/app/*`.
2. API routes live under `src/app/api/*`.
3. Route handlers delegate business logic to `src/services/*.domain.ts`.
4. Services read and write Mongoose models under `src/models/*`.
5. Shared auth, validation, and request helpers live under `src/lib/*`.

## Auth and Access Control

### Session Flow

- Browser requests first pass through `src/middleware.ts`.
- Access tokens and refresh tokens are stored in cookies.
- API routes usually use `src/lib/api-utils.ts` plus `src/lib/api-auth.ts`.
- Session payload shape comes from `src/lib/jwt-auth.ts`.

### Identity Sources

There are two personnel sources in code:

- `users`: current main source for drivers, leaders, and sometimes admins
- `leaders`: legacy/fallback source for password-based leader login

Important consequence:

- when debugging login or branch scope, inspect both `users` and `leaders`
- `admin_root` is still a special hardcoded admin identity in auth and leave flows

## Route Groups That Matter Most

### Driver-Facing

- `src/app/home`
- `src/app/leave`
- `src/app/leave/history`
- `src/app/dashboard`
- `src/app/contacts`
- `src/app/car-wash`

### Leader-Facing

- `src/app/leader/home`
- `src/app/leader/approve`
- `src/app/leader/history`
- `src/app/leader/drivers`
- `src/app/leader/attendance`
- `src/app/leader/substitute`
- `src/app/leader/tasks`
- `src/app/leader/settings`

### Admin-Facing

- `src/app/admin/home`
- `src/app/admin/approve`
- `src/app/admin/history`
- `src/app/admin/drivers`
- `src/app/admin/attendance`
- `src/app/admin/branches`
- `src/app/admin/tasks`
- `src/app/admin/settings`

## Service Layer Overview

### `auth.domain.ts`

Handles:

- LINE login
- leader/admin password login
- current session lookup
- profile updates
- cookie attachment and logout behavior

### `leave.domain.ts`

Handles:

- leave list scope by role
- leave creation
- leave review
- leave cancellation
- quota adjustments
- realtime leave events

Important current behavior:

- leader branch scope is resolved from the database, not trusted from JWT alone
- mixed `userId` lookup is still handled defensively in queries
- `scripts/migrate-leave-userids.mjs` exists to normalize old leave data

### `attendance.domain.ts`

Handles attendance history, corrections, leader/admin attendance workflows, and timeline logic.

### `tasks.domain.ts`

Handles task creation, scoring, assignment, and management workflows.

### `ops.domain.ts`

Handles substitute records, work schedules, online heartbeats, and profile stats.

### `branches.domain.ts`

Provides branch lists, branch-level counts, and sync behavior used by admin and leader UIs.

## API Pattern

Most routes follow the same pattern:

1. parse query/body with Zod schemas from `src/lib/validations/*`
2. use `apiHandler()` from `src/lib/api-utils.ts`
3. pass request scope to a domain service
4. return normalized JSON `{ success, ... }`

Examples:

- `src/app/api/leave/route.ts`
- `src/app/api/leave/[id]/route.ts`
- `src/app/api/users/route.ts`
- `src/app/api/tasks/route.ts`

## Realtime Channels

Main Pusher channel usage lives in:

- `src/lib/pusher.ts`
- `src/hooks/usePusher.ts`

Frequently used channels:

- `leave-requests`
- `dashboard`
- `users`

## Current Leave / Calendar Notes

The current leave/dashboard implementation now depends on:

- `src/lib/leave-calendar.ts`
- `src/lib/app-types.ts`
- `src/app/dashboard/page.tsx`

Important rule:

- prefer date-key comparison helpers over inline `Date` comparisons in calendar UIs
- this avoids timezone drift when rendering approved leave spans on the dashboard

## Known Technical Debt

- `src/middleware.ts` uses the deprecated `middleware` convention in Next 16; eventual migration to `proxy` is still pending
- some pages still define local UI-only interfaces instead of fully shared typed view models
- session loading is duplicated in multiple pages and could be centralized later
- `leaders` collection support remains for compatibility, even if most active data is in `users`

## Safe Verification Checklist

Run these after touching leave/auth/branch logic:

1. `npm run build`
2. `npm run test`
3. `npm run audit:leave-userids`

If you changed calendar logic, also inspect `src/lib/leave-calendar.test.ts`.
