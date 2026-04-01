# Project Structure

This is the current high-signal map of the repository.

## Root

```text
.
|-- src/
|-- public/
|-- scripts/
|-- docs/
|-- package.json
|-- next.config.ts
|-- tsconfig.json
|-- vitest.config.ts
```

## `src/`

```text
src
|-- app/
|   |-- admin/
|   |-- api/
|   |-- car-wash/
|   |-- contacts/
|   |-- dashboard/
|   |-- home/
|   |-- leader/
|   |-- leave/
|   |-- login/
|   |-- profile/
|   |-- profile-edit/
|   |-- profile-setup/
|   |-- settings/
|   `-- tasks/
|-- components/
|-- hooks/
|-- lib/
|-- models/
|-- services/
`-- test/
```

## App Areas

### `src/app/admin`

Admin screens for:

- approval
- attendance audit and corrections
- branches
- drivers
- history
- tasks
- settings
- car wash moderation

### `src/app/leader`

Leader screens for:

- home
- leave approval
- attendance
- drivers
- history
- substitute logs
- tasks
- settings
- car wash activity

### `src/app/leave`

Driver leave entry and leave history logic. This folder also contains private hooks and API client helpers for leave-specific screens.

### `src/app/dashboard`

Shared approved-leave calendar view used across roles. Date rendering logic should use helpers from `src/lib/leave-calendar.ts`.

### `src/app/api`

Current route groups:

- `attendance`
- `auth`
- `branches`
- `car-wash`
- `counts`
- `debug-scope`
- `leaders`
- `leave`
- `line-webhook`
- `online`
- `profile`
- `seed`
- `shifts`
- `substitute`
- `tasks`
- `user`
- `users`
- `work-schedule`

## Shared Logic

### `src/services`

Business logic lives here. Current main files:

- `auth.domain.ts`
- `attendance.domain.ts`
- `branches.domain.ts`
- `car-wash.domain.ts`
- `leaders.domain.ts`
- `leave.domain.ts`
- `ops.domain.ts`
- `tasks.domain.ts`
- `users.domain.ts`

### `src/lib`

Shared helpers and infrastructure:

- auth and JWT helpers
- Mongo connection
- API wrapper/error utilities
- Pusher helpers
- validation schemas
- shared date and leave helpers
- app-level shared types in `app-types.ts`

### `src/models`

Mongoose models currently include:

- `User`
- `Leader`
- `LeaveRequest`
- `Attendance`
- `AttendanceCorrection`
- `Task`
- `SubstituteRecord`
- `CarWashActivity`
- `ShiftTemplate`
- `WorkSchedule`
- `Settings`

## Scripts

### `scripts/migrate-leave-userids.mjs`

Purpose:

- audit legacy `LeaveRequest.userId` formats
- migrate old string-based IDs to `ObjectId`

Commands:

- `npm run audit:leave-userids`
- `npm run migrate:leave-userids`

## Docs

Use these as the current documentation set:

- `docs/CURRENT_ARCHITECTURE.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/AI_HANDOFF.md`

Older `ARCHITECTURE.md` files are retained only for history and should not be treated as source of truth.
