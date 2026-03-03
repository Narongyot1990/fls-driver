# AGENTS.md - Agent Coding Guidelines

This file provides guidelines for AI agents working in this repository.

## Project Overview

ITL Leave Management System — a mobile-first web app for drivers to request leave and leaders to approve/manage requests. Built with Next.js 16, MongoDB (Mongoose), and custom JWT authentication.

## Commands

### Build & Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint on entire project
npx tsc --noEmit     # TypeScript type-check only (no emission)
```

### Running Single Commands
```bash
npx eslint src/app/api/users/route.ts  # Lint single file
npx tsc --noEmit src/app/login/page.tsx  # Type-check single file
```

### Database Seeding
```bash
# Seed leader account
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "itl-leave-system-secret-2024"}'

# Reset all data
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "itl-leave-system-secret-2024", "action": "reset"}'
```

## New Dependencies (March 2026)

This project uses additional libraries:
- `react-day-picker` - Date picker modal component
- `dayjs` - Date manipulation library
- `lucide-react` - Icon library

## File Organization
- **API Routes**: `src/app/api/[resource]/route.ts`
- **Pages**: `src/app/[path]/page.tsx`
- **Components**: `src/components/*.tsx`
- **Models**: `src/models/*.ts`

## Code Style Guidelines

### Imports
```typescript
// Use path alias @/ for src directory
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

// Client components must 'use client'
'use client';
import { useState, useEffect } from 'react';

// Server-only code (never import in client)
import mongoose from 'mongoose';  // OK in API routes only

// Date handling
import dayjs from 'dayjs';
import { DayPicker } from 'react-day-picker';
```

### TypeScript Conventions
```typescript
// Interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Use explicit return types for API routes
export async function GET(request: NextRequest): Promise<NextResponse> { }

// Use 'any' sparingly - prefer specific types
```

### Naming Conventions
- **Files**: kebab-case (`leave-request.ts`, `date-picker-modal.tsx`)
- **Components**: PascalCase (`PageHeader.tsx`, `DatePickerModal.tsx`)
- **Interfaces**: PascalCase (`LeaveRequest`, `DriverUser`)
- **Functions**: camelCase (`fetchDrivers`, `handleSubmit`)

### API Routes Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ModelName } from '@/models/ModelName';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    await dbConnect();
    const data = await ModelName.find();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### React Components
```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

export default function PageName() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => { }, []);

  if (!data) return null;

  return (
    <div className="container">
      <h1 style={{ color: 'var(--text-primary)' }}>Title</h1>
    </div>
  );
}
```

### UI/CSS Guidelines
```css
/* Use CSS variables from src/app/globals.css */
background: var(--bg-base);
color: var(--text-primary);
border-radius: var(--radius-md);

/* Use Tailwind utility classes */
<div className="card p-4 flex items-center gap-3">

/* react-day-picker styles */
import 'react-day-picker/style.css';
```

### Auth Helpers
```typescript
// Always call before DB operations in API routes
const authResult = requireAuth(request);
if ('error' in authResult) return authResult.error;
```

### Mongoose Models
```typescript
// Use this pattern to avoid HMR re-registration
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
```

### API Response Format
```typescript
// Success
return NextResponse.json({ success: true, data: {...} });
// Error
return NextResponse.json({ error: 'Error message' }, { status: 400 });
```

## Key Architecture Notes

1. **Two JWT libraries**: `jose` (middleware) and `jsonwebtoken` (API routes)
2. **Two user roles**: Driver (LINE OAuth) and Leader (Email/Password)
3. **Pusher channels**: `leave-requests` and `driver-{userId}`
4. **No test framework configured** - Do not add tests without consulting the team.

## Pages Overview

### Driver Pages
- `/home` - Home menu (ขอลา, ประวัติการลา, ปฏิทิน)
- `/leave` - Request leave with DatePickerModal
- `/leave/history` - Leave history
- `/dashboard` - Calendar view
- `/profile` - Profile with inline edit

### Leader Pages
- `/leader/home` - Dashboard with notification badges
- `/leader/approve` - Approve leave requests
- `/leader/history` - All leave/substitute records
- `/leader/drivers` - Driver management (activate/deactivate/delete)
- `/leader/substitute` - Record substitute

## Environment Variables
```
MONGODB_URI=          # MongoDB Atlas connection string
LINE_CHANNEL_ID=       # LINE Channel ID
LINE_CHANNEL_SECRET=   # LINE Channel Secret
LINE_REDIRECT_URI=     # LINE OAuth callback URL
NEXT_PUBLIC_*=        # Public env vars (exposed to client)
PUSHER_*=             # Pusher credentials
JWT_SECRET=           # Access token secret
REFRESH_SECRET=       # Refresh token secret
```

### Running Single Commands
```bash
npx eslint src/app/api/users/route.ts  # Lint single file
npx tsc --noEmit src/app/login/page.tsx  # Type-check single file
```

### Database Seeding
```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "itl-leave-system-secret-2024"}'
```

## Code Style Guidelines

### File Organization
- **API Routes**: `src/app/api/[resource]/route.ts`
- **Pages**: `src/app/[path]/page.tsx`
- **Components**: `src/components/*.tsx`
- **Models**: `src/models/*.ts`

### Imports
```typescript
// Use path alias @/ for src directory
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

// Client components must 'use client'
'use client';
import { useState } from 'react';

// Server-only code (never import in client)
import mongoose from 'mongoose';  // OK in API routes only
```

### TypeScript Conventions
```typescript
// Interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Use explicit return types for API routes
export async function GET(request: NextRequest): Promise<NextResponse> { }

// Use 'any' sparingly - prefer specific types
```

### Naming Conventions
- **Files**: kebab-case (`leave-request.ts`)
- **Components**: PascalCase (`PageHeader.tsx`)
- **Interfaces**: PascalCase (`LeaveRequest`)
- **Functions**: camelCase (`fetchDrivers`)

### API Routes Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ModelName } from '@/models/ModelName';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;
    await dbConnect();
    const data = await ModelName.find();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### React Components
```typescript
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PageName() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => { }, []);

  if (!data) return null;

  return (
    <div className="container">
      <h1 style={{ color: 'var(--text-primary)' }}>Title</h1>
    </div>
  );
}
```

### UI/CSS Guidelines
```css
/* Use CSS variables from src/app/globals.css */
background: var(--bg-base);
color: var(--text-primary);
border-radius: var(--radius-md);

/* Use Tailwind utility classes */
<div className="card p-4 flex items-center gap-3">
```

### Auth Helpers
```typescript
// Always call before DB operations in API routes
const authResult = requireAuth(request);
if ('error' in authResult) return authResult.error;
```

### Mongoose Models
```typescript
// Use this pattern to avoid HMR re-registration
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
```

### API Response Format
```typescript
// Success
return NextResponse.json({ success: true, data: {...} });
// Error
return NextResponse.json({ error: 'Error message' }, { status: 400 });
```

## Key Architecture Notes

1. **Two JWT libraries**: `jose` (middleware) and `jsonwebtoken` (API routes)
2. **Two user roles**: Driver (LINE OAuth) and Leader (Email/Password)
3. **Pusher channels**: `leave-requests` and `driver-{userId}`
4. **No test framework configured** - Do not add tests without consulting the team.

## Environment Variables
```
MONGODB_URI=, LINE_CHANNEL_ID=, LINE_CHANNEL_SECRET=, LINE_REDIRECT_URI=
NEXT_PUBLIC_LINE_CHANNEL_ID=, NEXT_PUBLIC_LINE_REDIRECT_URI=
PUSHER_APP_ID=, PUSHER_KEY=, PUSHER_SECRET=, PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=, NEXT_PUBLIC_PUSHER_CLUSTER=
JWT_SECRET=, REFRESH_SECRET=
```
