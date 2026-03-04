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

## Deployment

GitHub repo: https://github.com/Narongyot1990/fls-driver (connected to Vercel project `drivers`)

Push to `master` → Vercel auto-deploys to https://drivers-tau.vercel.app

```bash
git add <files>
git commit -m "feat: ..."
git push
```

## Architecture

### Auth System (Custom JWT, not NextAuth)

Two separate JWT libraries are used intentionally:
- **`jose`** (`src/lib/jwt-edge.ts`) — Edge-compatible, used exclusively in `src/middleware.ts`
- **`jsonwebtoken`** (`src/lib/jwt-auth.ts`) — Node.js, used in API route handlers via `src/lib/api-auth.ts`

Tokens stored as httpOnly cookies: `accessToken` (15 min) + `refreshToken` (7 days). The middleware silently rotates tokens on refresh.

> **Note:** NextAuth (`src/lib/auth.ts` + `/api/auth/[...nextauth]`) is installed but **completely unused** — the custom JWT system is the real implementation. Treat it as dead code.

### Two User Roles

| Role | Login | Auth |
|------|-------|------|
| Driver | LINE OAuth → `/api/auth/line` | Custom JWT |
| Leader | Email/Password → `/api/auth/leader-login` | Custom JWT |

New Driver accounts start with `status: 'pending'` and must be activated by a Leader before they can submit leave requests. Drivers with `status: 'pending'` are blocked from creating leave requests at the API level. Pusher triggers a real-time notification to the driver on activation.

### Middleware (`src/middleware.ts`)

Runs on all routes except static files. Handles:
1. Public path bypass (login pages, auth endpoints, `/api/seed`)
2. Token verification → role-based redirect enforcement
3. Automatic access token refresh from refresh token

Leaders are redirected to `/leader/home`; drivers attempting `/leader/*` paths are redirected to `/home`. `/dashboard` is accessible by both roles.

### Real-time Notifications (Pusher)

Pusher triggers in two places:
- New leave request → channel `leave-requests`, event `new-leave-request`
- Driver activated by leader → channel `driver-{userId}`, event `driver-activated`

### API Route Pattern

All API routes use `src/lib/api-auth.ts` helpers:
- `requireAuth(request)` — any authenticated user
- `requireLeader(request)` — leaders only
- `requireDriver(request)` — drivers only

Each helper returns a discriminated union: `{ payload }` on success or `{ error: NextResponse }` on failure.

Always call `await dbConnect()` before any Mongoose operation.

### Data Models

**User** — Both driver and leader profiles share the User concept, but drivers are stored in `User` and leaders in `Leader`.

- Driver `status`: `'pending'` | `'active'` — pending users cannot submit leave requests
- Leave quotas tracked as fields: `vacationDays`, `sickDays`, `personalDays`
- Leaders can only delete users with `status: 'pending'`; active driver records are protected

**LeaveRequest** — `leaveType`: `vacation` | `sick` | `personal` | `unpaid`; `status`: `pending` | `approved` | `rejected` | `cancelled`

**SubstituteRecord** — Records non-leave driver incidents managed by leaders (`/leader/substitute`):
- `recordType`: `vacation` | `sick` | `personal` | `unpaid` | `absent` | `late` | `accident` | `damage`
- Fields: `userId`, `recordType`, `description`, `date`, `createdBy`
- API: `GET/POST /api/substitute`

**Leader** — `email`, `password` (bcrypt), `name`

### Leave Request Validation (`POST /api/leave`)

The API enforces in order:
1. Driver must have `name + surname` set (profile completion required)
2. Driver `status` must be `'active'`
3. No overlapping leave dates
4. Sufficient quota remaining (`vacationDays` / `sickDays` / `personalDays`)

Error messages are returned in Thai.

## Key Conventions

- **Brand colors**: Dark Blue `#002B5B`, Green `#00d084`
- **Path alias**: `@/` maps to `src/`
- Mongoose models use the pattern `mongoose.models.ModelName || mongoose.model(...)` to avoid re-registration in dev HMR
- `mongoose`, `mongodb`, and `bcryptjs` are listed as `serverExternalPackages` in `next.config.ts` — they must never be imported in client components or edge runtime code
- API responses: `{ success: true, data }` on success, `{ error: "message" }` with status code on error
- Driver pages use `localStorage` to cache user state and display cached data if API calls fail
- All user-facing labels (leave types, status, record types) are in Thai and defined in `src/lib/types.ts` (`leaveTypeLabels`, `substituteTypeLabels`, `statusLabels`, etc.)

## UI Design System — Minimalist Pro Theme

The entire app uses a consistent design system with light/dark mode support via `ThemeProvider` (`next-themes`).

### CSS Variables (`src/app/globals.css`)
- **Colors**: `--accent`, `--success`, `--warning`, `--danger`, `--text-primary`, `--text-secondary`, `--text-muted`
- **Backgrounds**: `--bg-base`, `--bg-surface`, `--bg-inset`
- **Spacing**: `--radius-sm/md/lg/xl`, `--shadow-sm/md/lg/accent`
- **Typography**: Fluid sizing with `clamp()` — `--text-fluid-xs` through `--text-fluid-3xl`

### Shared Components
- **`PageHeader`** — Sticky header with title, optional subtitle, back button, and theme toggle
- **`Sidebar`** — Desktop navigation (hidden on mobile)
- **`BottomNav`** — Mobile navigation (hidden on desktop)
- **`DatePickerModal`** — Date range picker using `react-day-picker`

### Utility Classes
- `.card` / `.card-neo` — Elevated containers with shadows
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` — Consistent buttons
- `.input` — Form inputs with focus states
- `.badge` / `.badge-success` / `.badge-warning` / `.badge-danger` / `.badge-accent` — Status indicators

### Icons
- **Lucide React** icons used throughout
- Leave type icons: `Umbrella` (vacation), `Thermometer` (sick), `Briefcase` (personal), `Ban` (unpaid)

### User Display Pattern
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

Display priority: Show `name + surname` if available, otherwise fall back to `lineDisplayName`. Profile images are shown as round avatars (32px in calendar popups, 40px in leader pages).

### Layout Patterns
- Leader list pages (`/leader/drivers`, `/leader/history`): tabs and summary stats are sticky; the list scrolls independently with `overflow-y-auto`

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

## Moments/Car Wash — Pending Improvements

ระบบ Moments (หน้า car wash feed) ต้องแก้ไข 8 ประเด็นต่อไปนี้ ให้ implement ตามลำดับ

### 1. Date/Time Picker — ใช้ DatePickerModal ที่มีอยู่แล้ว

**ไฟล์ที่แก้:** `src/app/car-wash/page.tsx`, อาจสร้าง `src/components/TimePickerModal.tsx`

ตอนนี้หน้า create activity ใช้ native `<input type="date">` + `<select>` dropdown สำหรับเวลา ซึ่งดู design ไม่สอดคล้องกับแอป

**สิ่งที่ต้องทำ:**
- เปลี่ยน date picker → ใช้ `DatePickerModal` (`src/components/DatePickerModal.tsx`) ที่มีอยู่แล้ว แต่ปรับ mode เป็น `"single"` (ไม่ใช่ range) เพราะ activity ต้องเลือกวันเดียว ถ้า DatePickerModal รองรับเฉพาะ range ให้เพิ่ม prop `mode` เพื่อ toggle ได้
- เปลี่ยน time picker → สร้าง `TimePickerModal` ใหม่ที่ design เหมือน DatePickerModal (ใช้ framer-motion, same card style, overlay backdrop) แสดง time slots เป็น grid แทน `<select>`
- Format แสดงผลวันที่ทุกที่ → ใช้ `toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })` ตาม pattern ที่ใช้ทั่วแอป (ดู `formatDateThai` ใน `src/lib/types.ts`)
- DatePickerModal สำหรับ activity ต้อง **อนุญาตเลือกวันในอดีต** (ไม่เหมือน leave request ที่ `fromDate={today}`) เพราะ driver อาจบันทึกย้อนหลัง
- Preview text ใช้ Thai format: เช่น "4 มี.ค. 2569 เวลา 14:30 น."

### 2. Loading Modal หลังบันทึก

**ไฟล์ที่แก้:** `src/app/car-wash/page.tsx`

ตอนนี้มีแค่ spinner เล็กๆ ในปุ่ม "กำลังบันทึก..." ซึ่งผู้ใช้มองไม่เห็นว่ากำลังทำงาน

**สิ่งที่ต้องทำ:**
- เพิ่ม **full-screen loading overlay** (framer-motion AnimatePresence) ตอน submit
- แสดง spinner ขนาดใหญ่ (w-12 h-12) + ข้อความ "กำลังบันทึกกิจกรรม..." กลางจอ
- Overlay: `position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.5)`
- ใช้ design variables จาก globals.css (`--bg-surface`, `--accent`, `--text-primary`)
- Spinner ใช้ pattern เดียวกับที่ใช้ทั่วแอป: `border-[3px] animate-spin` + `borderColor: var(--border), borderTopColor: var(--accent)`

### 3. Redirect ไปหน้า Moments หลังบันทึกสำเร็จ

**ไฟล์ที่แก้:** `src/app/car-wash/page.tsx`

ตอนนี้หลัง save สำเร็จแค่ reset form + แสดง success message อยู่หน้าเดิม ทำให้ผู้ใช้สับสน

**สิ่งที่ต้องทำ:**
- หลัง `POST /api/car-wash` สำเร็จ → `router.push('/car-wash/feed')` ทันที
- ไม่ต้อง reset form / ไม่ต้องแสดง success message ในหน้า create (เพราะจะ redirect ออกเลย)
- Loading overlay จากข้อ 2 จะแสดงจนกว่า redirect จะเสร็จ

### 4. Pagination — โหลด 10 รายการ + Infinite Scroll

**ไฟล์ที่แก้:** `src/app/api/car-wash/route.ts`, `src/app/car-wash/feed/page.tsx`, `src/app/leader/car-wash/page.tsx`

ตอนนี้ `GET /api/car-wash` โหลดทุก record ในครั้งเดียว เมื่อข้อมูลเยอะจะช้ามาก

**API — เพิ่ม pagination:**
```
GET /api/car-wash?page=1&limit=10&activityType=car-wash&userId=xxx
```
- เพิ่ม query params: `page` (default: 1), `limit` (default: 10)
- ใช้ `.skip((page - 1) * limit).limit(limit)` ใน Mongoose query
- Response: `{ success: true, activities: [...], hasMore: boolean, total: number }`
- `hasMore` = `skip + activities.length < total`

**Client — Infinite Scroll:**
- โหลด 10 รายการแรกตอน mount
- ใช้ `IntersectionObserver` ที่ element สุดท้ายของ list (sentinel div)
- เมื่อ sentinel เข้า viewport → fetch page ถัดไป, append ต่อท้าย `activities` state
- แสดง loading spinner ตอนโหลดเพิ่ม (ใช้ pattern spinner เดียวกับแอป)
- หยุด fetch เมื่อ `hasMore === false`
- ทำทั้ง **driver feed** (`src/app/car-wash/feed/page.tsx`) และ **leader feed** (`src/app/leader/car-wash/page.tsx`)

### 5. Filter เฉพาะโพสต์ของตัวเอง

**ไฟล์ที่แก้:** `src/app/car-wash/feed/page.tsx`

**สิ่งที่ต้องทำ:**
- เพิ่ม filter option ใน `filterOptions` array:
  ```typescript
  { key: 'mine', label: 'ของฉัน' }
  ```
- เมื่อเลือก "ของฉัน" → ส่ง `userId` param ไป API: `GET /api/car-wash?userId={user.id}`
- Reset page กลับไป 1 เมื่อเปลี่ยน filter
- Design: ใช้ pill-style tab เดียวกับ filter ที่มีอยู่

### 6. แสดง Created Date/Time ใน Post Card ให้ชัดเจน

**ไฟล์ที่แก้:** `src/app/car-wash/feed/page.tsx`, `src/app/leader/car-wash/page.tsx`

ตอนนี้แสดง `dayjs(createdAt).fromNow()` + `activityTime` แต่ไม่ชัดเจน

**สิ่งที่ต้องทำ:**
- เรียงข้อมูลใน post header:
  - **บรรทัด 1:** ชื่อ driver (font-semibold)
  - **บรรทัด 2:** วันที่กิจกรรม + เวลา ในรูปแบบ Thai: `"4 มี.ค. 2569 · 14:30 น."` (ใช้ `formatDateThai` จาก `src/lib/types.ts` + activityTime)
  - **บรรทัด 3 (เล็กกว่า):** relative time `dayjs(createdAt).fromNow()` เป็น text-muted เช่น "โพสต์เมื่อ 2 ชั่วโมงที่แล้ว"
- ใช้ `text-fluid-xs` สำหรับบรรทัด 2-3, `text-fluid-sm` สำหรับชื่อ
- Color: บรรทัด 2 ใช้ `--text-secondary`, บรรทัด 3 ใช้ `--text-muted`

### 7. แก้ Pusher Console Errors (สีแดงใน Network Tab)

**ไฟล์ที่ตรวจ:** `.env.local`, `src/app/car-wash/feed/page.tsx`, `src/app/leader/car-wash/page.tsx`

**อาการ:**
```
Request URL: https://sockjs.pusher.com/pusher/app//469/...
```
สังเกต `app//` มี **double slash** = APP_ID ว่างเปล่า → Pusher client ไม่ได้รับ key ที่ถูกต้อง

**สิ่งที่ต้องตรวจ/แก้:**
1. ตรวจ `.env.local` ว่า `NEXT_PUBLIC_PUSHER_KEY` และ `NEXT_PUBLIC_PUSHER_CLUSTER` มีค่าถูกต้อง (ไม่ว่าง, ไม่มี space หรือ quote)
2. ตรวจ Vercel environment variables ว่าตั้งค่า `NEXT_PUBLIC_PUSHER_KEY` + `NEXT_PUBLIC_PUSHER_CLUSTER` แล้ว
3. เพิ่ม **guard check** ก่อนสร้าง Pusher client ในทั้ง 2 feed pages:
   ```typescript
   const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
   if (!pusherKey) {
     console.warn('NEXT_PUBLIC_PUSHER_KEY is not set — real-time disabled');
     return;
   }
   ```

### 8. Real-time ไม่ Update ต้อง Refresh — แก้ Pusher Client

**ไฟล์ที่แก้:** สร้าง `src/lib/pusher-client.ts`, แก้ `src/app/car-wash/feed/page.tsx`, `src/app/leader/car-wash/page.tsx`

**สาเหตุหลัก:** Pusher connection ล้มเหลวจากปัญหาข้อ 7 + connection leak

**สิ่งที่ต้องทำ:**

1. **สร้าง Pusher client singleton** — ไฟล์ `src/lib/pusher-client.ts`:
   ```typescript
   import Pusher from 'pusher-js';

   let pusherInstance: Pusher | null = null;

   export function getPusherClient(): Pusher | null {
     if (typeof window === 'undefined') return null;
     const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
     const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
     if (!key || !cluster) return null;

     if (!pusherInstance) {
       pusherInstance = new Pusher(key, { cluster });
     }
     return pusherInstance;
   }
   ```

2. **แก้ทั้ง 2 feed pages** — ใช้ singleton แทนสร้าง new Pusher ทุกครั้ง:
   ```typescript
   import { getPusherClient } from '@/lib/pusher-client';

   useEffect(() => {
     const pusher = getPusherClient();
     if (!pusher) return;

     const channel = pusher.subscribe('car-wash-feed');
     // ... bind events ...

     return () => {
       channel.unbind_all();
       pusher.unsubscribe('car-wash-feed');
     };
   }, [user]);  // ลบ filterType ออกจาก dependency — filter ทำ client-side
   ```

3. **Pusher event handler ต้อง check filterType** ภายใน handler (ใช้ ref) ไม่ใช่ dependency:
   ```typescript
   const filterTypeRef = useRef(filterType);
   filterTypeRef.current = filterType;

   // ใน new-activity handler:
   if (filterTypeRef.current && activity.activityType !== filterTypeRef.current) return;
   ```

4. **อัพเดท Pusher channel list ใน CLAUDE.md** (Real-time Notifications section):
   - Car wash feed → channel `car-wash-feed`, events: `new-activity`, `update-activity`, `delete-activity`
