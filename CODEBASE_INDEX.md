# ITL Drivers - Codebase Index

> **Project:** ITL Leave Management System  
> **Type:** Mobile-First Web Application  
> **Tech Stack:** Next.js 16 + TypeScript + MongoDB Atlas + LINE Login + Pusher  
> **Location:** `D:/projects/ITL/drivers`

---

## 📁 Project Overview

This is a **leave management system** for ITL drivers with two user roles:

| Role | Login Method | Access |
|------|--------------|--------|
| **Driver** | LINE OAuth | Request leave, view history, car wash activities |
| **Leader** | Email/Password | Approve leave, manage drivers, view analytics |

---

## 📂 Directory Structure

```
src/
├── app/                    # Next.js App Router (Pages & API)
├── components/            # Reusable React components
├── lib/                   # Utilities, auth, configs
├── models/                # Mongoose database models
├── hooks/                 # Custom React hooks
└── middleware.ts          # Next.js middleware (auth)
```

---

## 🗄️ Database Models (`src/models/`)

### User.ts
- **Purpose:** Driver accounts (LINE users)
- **Key Fields:**
  - `lineUserId` (unique), `lineDisplayName`, `lineProfileImage`
  - `performanceTier` (standard|bronze|silver|gold|platinum)
  - `performancePoints`, `performanceLevel`
  - `name`, `surname`, `phone`, `employeeId`, `branch` (AYA|CBI|KSN|RA2|BBT)
  - `status` (pending|active)
  - `vacationDays`, `sickDays`, `personalDays` (leave quotas)
- **Pattern:** `mongoose.models.User || mongoose.model('User', UserSchema)`

### Leader.ts
- **Purpose:** Leader/Admin accounts (manual)
- **Key Fields:**
  - `email` (unique), `password` (hashed bcrypt)
  - `name`, `branch` (assigned by admin)
  - `role` (leader|admin)
  - **Note:** `admin` role = Superuser, can manage all branches

### LeaveRequest.ts
- **Purpose:** Leave request records
- **Key Fields:**
  - `userId` (ref: User)
  - `leaveType` (vacation|sick|personal|unpaid)
  - `startDate`, `endDate`, `reason`
  - `status` (pending|approved|rejected|cancelled)
  - `approvedBy` (ref: Leader), `approvedAt`, `rejectedReason`

### SubstituteRecord.ts
- **Purpose:** Track substitute/deduction records
- **Key Fields:**
  - `userId` (ref: User)
  - `recordType` (vacation|sick|personal|unpaid|absent|late|accident|damage)
  - `description`, `date`, `createdBy` (ref: Leader)

### CarWashActivity.ts
- **Purpose:** Car wash social feed entries
- **Key Fields:**
  - `userId` (ref: User), `activityType` (default: "car-wash")
  - `imageUrls[]`, `caption`, `activityDate`, `activityTime`
  - `likes[]` (ref: User), `comments[]` (with userId, text, createdAt)
  - `marked` (boolean), `markedBy`, `markedAt`

---

## 🔧 Library Files (`src/lib/`)

### mongodb.ts
- **Function:** `dbConnect()` - Singleton MongoDB connection with caching
- **Uses:** Mongoose with connection buffering disabled

### auth.ts
- **Purpose:** NextAuth configuration (installed but **UNUSED**)
- **Actual Auth:** Custom JWT system (see jwt-auth.ts, jwt-edge.ts)

### api-auth.ts
- **Functions:**
  - `getTokenPayload(request)` - Extract payload from cookies
  - `requireAuth(request)` - Verify authentication
  - `requireLeader(request)` - Verify leader role
  - `requireDriver(request)` - Verify driver role
  - `requireAdmin(request)` - Verify admin role

### jwt-auth.ts
- **Functions:**
  - `generateAccessToken(payload)` - 15min access token
  - `generateRefreshToken(payload)` - 7d refresh token
  - `verifyAccessToken(token)` - Validate access token
  - `verifyRefreshToken(token)` - Validate refresh token
  - `setAuthCookies()`, `getAuthCookies()`, `clearAuthCookies()`
  - `getCurrentUser()` - Auto-refresh token flow

### jwt-edge.ts
- **Purpose:** Edge-compatible JWT for middleware (uses `jose` library)
- **Functions:** Same as jwt-auth.ts but for edge runtime

### pusher.ts
- **Purpose:** Server-side Pusher triggers for real-time
- **Channels:**
  - `car-wash-feed` - Car wash activities
  - `leave-requests` - Leave requests
  - `users` - Driver updates
  - `tasks` - Task updates
  - `dashboard` - Dashboard updates
- **Functions:**
  - `triggerPusher(channel, event, data)` - Fire-and-forget trigger

### pusher-client.ts
- **Purpose:** Client-side Pusher subscriptions

### types.ts
- **Interfaces:** `DriverUser`, `LeaderUser`, `LeaveRequestItem`, `SubstituteRecordItem`
- **Labels:** `leaveTypeLabels`, `statusLabels`, `substituteTypeLabels`
- **Colors:** `leaveTypeColors`, `statusColors`
- **Utils:** `formatDateThai(dateStr)`

### profile-tier.ts
- **Tiers:** standard, bronze, silver, gold, platinum
- **Config:** Points/level thresholds, styling classes
- **Functions:** `getPerformanceTier()`, `normalizePerformanceTier()`

### leave-types.ts
- **Leave Types:** vacation, sick, personal, unpaid
- **Record Types:** vacation, sick, personal, unpaid, absent, late, accident, damage
- **Status Badges:** pending, approved, rejected, cancelled
- **Function:** `getLeaveTypeMeta()`, `getRecordTypeLabel()`, `getStatusBadge()`

### date-utils.ts
- **Purpose:** Date manipulation utilities

### debounce.ts
- **Purpose:** Debounce function for inputs

### thai-holidays.ts
- **Purpose:** Thai holiday data

---

## 🔌 API Routes (`src/app/api/`)

### Authentication (`/api/auth/`)

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| POST | `/api/auth/line` | `line/route.ts` | LINE OAuth callback - creates/updates user, sets JWT cookies |
| POST | `/api/auth/leader-login` | `leader-login/route.ts` | Leader email/password login |
| POST | `/api/auth/logout` | `logout/route.ts` | Clear auth cookies |
| GET | `/api/auth/me` | `me/route.ts` | Get current user info |
| PATCH | `/api/auth/leader-profile` | `leader-profile/route.ts` | Update leader profile |
| * | `/api/auth/[...nextauth]` | `[...nextauth]/route.ts` | NextAuth (unused) |

### Leave (`/api/leave/`)

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/leave` | `leave/route.ts` | Get leave requests (filtered by user/branch/status) |
| POST | `/api/leave` | `leave/route.ts` | Create leave request (validates quota, profile) |
| GET | `/api/leave/[id]` | `leave/[id]/route.ts` | Get single leave request |
| PATCH | `/api/leave/[id]` | `leave/[id]/route.ts` | Approve/reject leave (leader only) |
| DELETE | `/api/leave/[id]` | `leave/[id]/route.ts` | Cancel leave request |

### Users (`/api/users/`)

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/users` | `users/route.ts` | List drivers (filtered by branch/status) |
| PATCH | `/api/users` | `users/route.ts` | Update driver (leader), activate, set quotas |
| DELETE | `/api/users` | `users/route.ts` | Delete pending user |
| GET | `/api/users/[id]` | `users/[id]/route.ts` | Get single driver |
| PATCH | `/api/users/[id]` | `users/[id]/route.ts` | Update driver details |

### User Profile (`/api/user/`)

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/user/profile` | `profile/route.ts` | Get own profile |
| PATCH | `/api/user/profile` | `profile/route.ts` | Update own profile |

### Car Wash (`/api/car-wash/`)

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/car-wash` | `car-wash/route.ts` | Get activities feed |
| POST | `/api/car-wash` | `car-wash/route.ts` | Create activity |
| GET | `/api/car-wash/[id]` | `car-wash/[id]/route.ts` | Get single activity |
| PATCH | `/api/car-wash/[id]` | `car-wash/[id]/route.ts` | Update activity |
| DELETE | `/api/car-wash/[id]` | `car-wash/[id]/route.ts` | Delete activity |
| POST | `/api/car-wash/image` | `car-wash/image/route.ts` | Upload image to Vercel Blob |

### Substitute (`/api/substitute/`)

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/substitute` | `substitute/route.ts` | Get substitute records |
| POST | `/api/substitute` | `substitute/route.ts` | Create substitute record |

### Other Routes

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/counts` | `counts/route.ts` | Get statistics (leave counts, driver counts) |
| GET | `/api/online` | `online/route.ts` | Update/check online status |
| POST | `/api/seed` | `seed/route.ts` | Seed initial data (requires secret key) |
| GET | `/api/tasks` | `tasks/route.ts` | Get tasks |
| POST | `/api/tasks` | `tasks/route.ts` | Create task |
| PATCH | `/api/tasks/[id]` | `tasks/[id]/route.ts` | Update task |
| GET | `/api/tasks/scores` | `tasks/scores/route.ts` | Get task scores |
| GET | `/api/leaders` | `leaders/route.ts` | List all leaders (admin only) |
| POST | `/api/leaders` | `leaders/route.ts` | Create new leader (admin only) |
| PATCH | `/api/leaders` | `leaders/route.ts` | Update leader (admin only) |
| PATCH | `/api/auth/leader-profile` | `leader-profile/route.ts` | Update own profile or (admin) any leader's branch/role |
| GET | `/api/branches` | `branches/route.ts` | Get all active branches (public) |
| POST | `/api/branches` | `branches/route.ts` | Create new branch (admin only) |
| PATCH | `/api/branches` | `branches/route.ts` | Update branch (admin only) |
| DELETE | `/api/branches` | `branches/route.ts` | Delete branch (admin only) |

**Branch Fields:**
- `code` - รหัสสาขา (AYA, CBI, RA2, KSN, BBT)
- `name` - ชื่อสาขา
- `description` - รายละเอียดสาขา
- `location` - พิกัด { lat, lon }
- `active` - เปิด/ปิดใช้งาน

---

## 🧩 Components (`src/components/`)

### PageHeader.tsx
- **Purpose:** Sticky page header with back button, title, theme toggle
- **Props:** `title`, `subtitle?`, `backHref?`, `showThemeToggle?`, `rightContent?`

### BottomNav.tsx
- **Purpose:** Mobile bottom navigation (driver role)

### Sidebar.tsx
- **Purpose:** Desktop sidebar navigation

### ThemeProvider.tsx
- **Purpose:** next-themes provider for dark/light mode

### ThemeToggle.tsx
- **Purpose:** Theme switch button

### DatePickerModal.tsx
- **Purpose:** Date range picker using react-day-picker

### TimePickerModal.tsx
- **Purpose:** Time picker component

### DriverProfile.tsx
- **Purpose:** Driver profile card with performance tier

### ProfileModal.tsx
- **Purpose:** Modal for viewing user profiles

### UserAvatar.tsx
- **Purpose:** User avatar with performance tier ring

### LikesPopup.tsx
- **Purpose:** Popup showing who liked an activity

### Toast.tsx
- **Purpose:** Toast notification component
- **Exports:** `useToast()`, `ToastProvider`
- **Usage:** `const { showToast } = useToast()` → `showToast('success', 'Message')`

---

## 🪝 Hooks (`src/hooks/`)

### useOnlineStatus.ts
- **Purpose:** Track user's online/offline status using heartbeat (NOT Pusher)
- **Uses:** `/api/online` endpoint, sends heartbeat every 30s

### usePusher.ts
- **Purpose:** Pusher channel subscription hook
- **Features:** Single channel subscribe, debounced callbacks (default 400ms)
- **Exports:** `usePusher`, `usePusherMulti`

---

## 🌐 Pages (`src/app/`)

### Driver Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `page.tsx` | Root redirect |
| `/login` | `login/page.tsx` | LINE Login page |
| `/login/callback` | `login/callback/page.tsx` | LINE OAuth callback handler |
| `/home` | `home/page.tsx` | Driver dashboard menu |
| `/leave` | `leave/page.tsx` | Request leave form |
| `/leave/history` | `leave/history/page.tsx` | Leave history |
| `/dashboard` | `dashboard/page.tsx` | Calendar view |
| `/profile` | `profile/page.tsx` | View profile |
| `/profile-edit` | `profile-edit/page.tsx` | Edit profile |
| `/profile-setup` | `profile-setup/page.tsx` | First-time profile setup |
| `/settings` | `settings/page.tsx` | Settings page |
| `/contacts` | `contacts/page.tsx` | Contact list |
| `/car-wash` | `car-wash/page.tsx` | Create car wash activity |
| `/car-wash/feed` | `car-wash/feed/page.tsx` | Car wash feed |

### Leader Pages

| Route | File | Description |
|-------|------|-------------|
| `/leader/login` | `leader/login/page.tsx` | Leader login (email/password) |
| `/leader/home` | `leader/home/page.tsx` | Leader dashboard |
| `/leader/approve` | `leader/approve/page.tsx` | Pending approvals |
| `/leader/history` | `leader/history/page.tsx` | All leave history |
| `/leader/drivers` | `leader/drivers/page.tsx` | Manage drivers |
| `/leader/substitute` | `leader/substitute/page.tsx` | Create substitute records |
| `/leader/car-wash` | `leader/car-wash/page.tsx` | View car wash feed |
| `/leader/tasks` | `leader/tasks/page.tsx` | Manage tasks |
| `/leader/profile-edit` | `leader/profile-edit/page.tsx` | Edit profile |
| `/leader/settings` | `leader/settings/page.tsx` | Settings |

### Admin (Superuser) Pages

| Route | File | Description |
|-------|------|-------------|
| `/admin/home` | `admin/home/page.tsx` | Superuser dashboard - view all branches |
| `/admin/leaders` | `admin/leaders/page.tsx` | Manage leaders (add/edit/assign branch) |
| `/admin/settings` | `admin/settings/page.tsx` | System settings |

**Note:** Admin can access all leader pages too. Admin role bypasses branch filtering.

### Auth Pages

| Route | File | Description |
|-------|------|-------------|
| `/api/auth/[...nextauth]` | `api/auth/[...nextauth]/route.ts` | NextAuth handler (unused) |

---

## ⚙️ Middleware (`src/middleware.ts`)

- **Purpose:** Route protection and token refresh
- **Features:**
  - Public path bypass (login, auth endpoints, static files)
  - Token verification
  - Role-based redirect (admin → /admin/*, leaders → /leader/*, drivers → /home)
  - **Admin has full access** - bypasses all branch filters
  - **Leader branch filter** - can only view drivers in assigned branch
  - **Driver branch filter** - can only view own data
  - Automatic token refresh (15min access, 7d refresh)

---

## 🔐 Authentication Flow

### Drivers (LINE OAuth)
1. User clicks LINE Login → redirects to LINE authorization
2. LINE redirects to `/login/callback` with auth code
3. `/api/auth/line` exchanges code for access token
4. Fetches LINE profile, creates/updates User in MongoDB
5. Generates JWT tokens, sets as httpOnly cookies

### Leaders (Email/Password)
1. User submits email/password to `/leader/login`
2. `/api/auth/leader-login` verifies against Leader collection
3. Generates JWT tokens, sets as httpOnly cookies

### Token Refresh
- Middleware checks both access and refresh tokens
- If access expired but refresh valid → generates new tokens silently
- Uses **jose** for edge runtime in middleware, **jsonwebtoken** in API routes

---

## 🎨 Design System (`src/app/globals.css`)

### Brand Colors
- **Dark Blue:** `#002B5B` (--accent)
- **Green:** `#00d084` (--success)

### CSS Variables
- **Colors:** `--accent`, `--success`, `--warning`, `--danger`, `--text-primary`, `--text-secondary`, `--text-muted`
- **Backgrounds:** `--bg-base`, `--bg-surface`, `--bg-inset`
- **Spacing:** `--radius-sm/md/lg/xl`, `--shadow-sm/md/lg/accent`
- **Typography:** Fluid sizing with `clamp()` (--text-fluid-xs to --text-fluid-3xl)

### Utility Classes
- `.card`, `.card-neo` - Elevated containers
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger` - Buttons
- `.input` - Form inputs
- `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-accent` - Status badges

---

## 🔔 Real-time Events (Pusher)

### Server-side Triggers

| Channel | Event | Trigger |
|---------|-------|---------|
| `leave-requests` | `new-leave-request` | New leave request created |
| `leave-requests` | `leave-status-changed` | Leave approved/rejected |
| `leave-requests` | `leave-cancelled` | Leave cancelled |
| `car-wash-feed` | `new-activity` | New car wash post |
| `car-wash-feed` | `update-activity` | Car wash post updated |
| `car-wash-feed` | `delete-activity` | Car wash post deleted |
| `users` | `driver-activated` | Driver activated by leader |
| `users` | `driver-updated` | Driver profile updated |
| `users` | `driver-deleted` | Driver deleted |
| `users` | `new-driver` | New driver registered |
| `tasks` | `new-task` | New task created |
| `tasks` | `task-updated` | Task updated |
| `tasks` | `task-deleted` | Task deleted |
| `tasks` | `task-submitted` | Task submitted |
| `dashboard` | - | Dashboard updates |

### Client-side Subscriptions (Pages using usePusher)

| Page | Channel | Events | Purpose |
|------|---------|--------|---------|
| `/leader/approve` | `leave-requests` | `new-leave-request`, `leave-status-changed`, `leave-cancelled` | Real-time leave approvals |
| `/leader/car-wash` | `car-wash-feed` | `new-activity`, `update-activity`, `delete-activity` | Real-time car wash feed |
| `/leader/drivers` | `users` | `new-driver`, `driver-activated`, `driver-updated`, `driver-deleted` | Real-time driver updates |
| `/leader/tasks` | `tasks` | `new-task`, `task-updated`, `task-deleted`, `task-submitted` | Real-time task updates |
| `/car-wash/feed` | `car-wash-feed` | `new-activity`, `update-activity`, `delete-activity` | Real-time feed updates |
| `/leave` | `leave-requests` | `leave-status-changed`, `leave-cancelled` | Real-time leave status |
| `/leave/history` | `leave-requests` | `leave-status-changed`, `leave-cancelled` | Real-time leave updates |
| `/home` | `users`, `tasks` | Multiple | Real-time user/task changes |
| `/dashboard` | `dashboard` | - | Real-time dashboard |
| `/contacts` | `users` | `driver-updated`, `driver-deleted` | Real-time contact updates |

### usePusher Hooks

- **usePusher.ts** - Subscribe to single channel with multiple event bindings (debounced 400ms)
- **usePusherMulti.ts** - Subscribe to multiple channels at once
- **useOnlineStatus.ts** - Heartbeat-based online status (uses `/api/online`, NOT Pusher)

---

## 🔧 Environment Variables

```
# MongoDB
MONGODB_URI=

# LINE Login
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_REDIRECT_URI=
NEXT_PUBLIC_LINE_CHANNEL_ID=
NEXT_PUBLIC_LINE_REDIRECT_URI=

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# JWT
JWT_SECRET=
REFRESH_SECRET=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```

---

## 📋 Key Functions Quick Reference

### Leave Request Flow (Driver)
```typescript
// POST /api/leave
1. Validate: userId, leaveType, startDate, endDate, reason
2. Check: profile complete (name + surname)
3. Check: user status = 'active'
4. Check: no overlapping leave
5. Check: sufficient quota (vacationDays/sickDays/personalDays)
6. Create: LeaveRequest with status='pending'
7. Trigger: Pusher 'new-leave-request'
```

### Leave Approval Flow (Leader)
```typescript
// PATCH /api/leave/[id]
1. Validate: leader role
2. Validate: status = 'approved' | 'rejected'
3. If approved: deduct quota from User
4. Update: LeaveRequest status, approvedBy, approvedAt
5. Trigger: Pusher 'leave-status-changed'
```

### Car Wash Activity Flow
```typescript
// POST /api/car-wash
1. Upload image to Vercel Blob
2. Create CarWashActivity with imageUrl
3. Trigger: Pusher 'new-activity'

// GET /api/car-wash (Feed)
- Populate userId (name, profile image, performance tier)
- Sort by createdAt descending
- Support pagination via limit/startIndex
```

---

## 📊 Status Codes

### User Status
- `pending` - New driver, awaiting leader activation
- `active` - Can request leave

### Leave Status
- `pending` - Awaiting leader approval
- `approved` - Approved by leader
- `rejected` - Rejected by leader
- `cancelled` - Cancelled by driver

### Leave Types
- `vacation` - ลาพักร้อน
- `sick` - ลาป่วย
- `personal` - ลากิจ
- `unpaid` - ลากิจไม่ได้รับค่าจ้าง

### Performance Tiers
- `standard` - Default (0 points, level 1)
- `bronze` - 150 points or level 2
- `silver` - 400 points or level 4
- `gold` - 800 points or level 6
- `platinum` - 1400 points or level 9

---

*Last Updated: March 2026*
