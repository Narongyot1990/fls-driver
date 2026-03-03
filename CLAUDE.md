# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ITL Leave Management System — a mobile-first web app for drivers (employees) to request leave and for leaders (managers) to approve/manage those requests.

- **Production**: https://drivers-tau.vercel.app
- **Database**: MongoDB Atlas cluster `driver-request`

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # TypeScript type-check only
```

No test framework is configured.

To seed a leader account (POST to `/api/seed` with `secretKey: "itl-leave-system-secret-2024"`), or reset all data with `action: "reset"`.

## Architecture

### Auth System (Custom JWT, not NextAuth)

Two separate JWT libraries are used intentionally:
- **`jose`** (`src/lib/jwt-edge.ts`) — Edge-compatible, used exclusively in `src/middleware.ts`
- **`jsonwebtoken`** (`src/lib/jwt-auth.ts`) — Node.js, used in API route handlers via `src/lib/api-auth.ts`

Tokens stored as httpOnly cookies: `accessToken` (15 min) + `refreshToken` (7 days). The middleware silently rotates tokens on refresh.

### Two User Roles

| Role | Login | Auth |
|------|-------|------|
| Driver | LINE OAuth → `/api/auth/line` | Custom JWT |
| Leader | Email/Password → `/api/auth/leader-login` | Custom JWT |

New Driver accounts start with `status: 'pending'` and must be activated by a Leader before they can submit leave requests. Pusher triggers a real-time notification to the driver on activation.

### Middleware (`src/middleware.ts`)

Runs on all routes except static files. Handles:
1. Public path bypass (login pages, auth endpoints, `/api/seed`)
2. Token verification → role-based redirect enforcement
3. Automatic access token refresh from refresh token

Leaders are redirected to `/leader/home`; drivers attempting `/leader/*` paths are redirected to `/home`.

### Real-time Notifications (Pusher)

Pusher triggers in two places:
- New leave request → channel `leave-requests`, event `new-leave-request`
- Driver activated by leader → channel `driver-{userId}`, event `driver-activated`

### API Route Pattern

All API routes use `src/lib/api-auth.ts` helpers:
- `requireAuth(request)` — any authenticated user
- `requireLeader(request)` — leaders only
- `requireDriver(request)` — drivers only

Always call `await dbConnect()` before any Mongoose operation.

## Key Conventions

- **Brand colors**: Dark Blue `#002B5B`, Green `#00d084`
- **Path alias**: `@/` maps to `src/`
- Mongoose models use the pattern `mongoose.models.ModelName || mongoose.model(...)` to avoid re-registration in dev HMR
- `mongoose`, `mongodb`, and `bcryptjs` are listed as `serverExternalPackages` in `next.config.ts` — they must never be imported in client components or edge runtime code
- API responses: `{ success: true, data }` on success, `{ error: "message" }` with status code on error

## UI Design System — Minimalist Pro Theme

The entire app uses a consistent design system with:

### CSS Variables (`src/app/globals.css`)
- **Colors**: `--accent`, `--success`, `--warning`, `--danger`, `--text-primary`, `--text-secondary`, `--text-muted`
- **Backgrounds**: `--bg-base`, `--bg-surface`, `--bg-inset`
- **Spacing**: `--radius-sm/md/lg/xl`, `--shadow-sm/md/lg/accent`
- **Typography**: Fluid sizing with `clamp()` — `--text-fluid-xs` through `--text-fluid-3xl`

### Shared Components
- **`PageHeader`** — Consistent page titles with optional subtitle and back button
- **`Sidebar`** — Desktop navigation (hidden on mobile)
- **`BottomNav`** — Mobile navigation (hidden on desktop)

### Utility Classes
- `.card` / `.card-neo` — Elevated containers with shadows
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` — Consistent buttons
- `.input` — Form inputs with focus states
- `.badge` / `.badge-success` / `.badge-warning` / `.badge-danger` / `.badge-accent` — Status indicators

### Icons
- **Lucide React** icons used throughout (replaced inline SVGs)
- Leave type icons: `Umbrella` (vacation), `Thermometer` (sick), `Briefcase` (personal), `Ban` (unpaid)

### Recent UI Enhancements (March 2025)

1. **Settings Page** (`/settings`)
   - Removed `employeeId` field
   - Now shows: name (ชื่อ-นามสกุล) + phone number only

2. **Dashboard Calendar Popup** (`/dashboard`)
   - Shows small round profile image (32px)
   - Displays full name + surname (fallback to LINE display name)
   - Leave type badge with date range

3. **Approve Page** (`/leader/approve`)
   - Profile images for all leave requests (round, 40px)
   - First line: Full name + surname
   - Second line: @LINE display name

4. **Drivers Management & Leader History** (`/leader/drivers`, `/leader/history`)
   - Tabs and summary stats remain sticky at top
   - List section scrolls independently with `overflow-y-auto`
   - Profile images shown in driver cards

### User Data Model
```typescript
interface User {
  lineDisplayName: string;      // LINE account name
  lineProfileImage?: string;    // LINE profile photo URL
  name?: string;                // Thai first name
  surname?: string;             // Thai last name
  phone?: string;
  employeeId?: string;
}
```

Display priority: Show `name + surname` if available, otherwise fall back to `lineDisplayName`.

## Environment Variables

Required in `.env.local`:
```
MONGODB_URI=
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_REDIRECT_URI=
NEXT_PUBLIC_LINE_CHANNEL_ID=
NEXT_PUBLIC_LINE_REDIRECT_URI=
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
JWT_SECRET=
REFRESH_SECRET=
```
