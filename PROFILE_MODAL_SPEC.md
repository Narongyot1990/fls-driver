# Profile Modal Feature - Specification

## Overview
เพิ่มฟีเจอร์ให้สามารถดู Profile ของคนอื่นได้ โดยการกดที่ Avatar/Profile Image จะแสดง Modal แสดงข้อมูลโปรไฟล์แบบ Read-only

---

## Current State

### Avatar Usage Locations
| หน้า | Path | Type |
|------|------|------|
| Dashboard | `/dashboard` | Popup - แสดงรายชื่อคนลา |
| Leader Approve | `/leader/approve` | รายการคนขอลา |
| Leader History | `/leader/history` | ประวัติการลา |
| Leader Drivers | `/leader/drivers` | รายชื่อคนขับ |
| Leader Car-wash | `/leader/car-wash` | Activity feed |
| Car-wash Feed | `/car-wash/feed` | Activity feed |

### Existing Avatar Component
```tsx
function Avatar({ user, size = 'md' }: { 
  user?: UserInfo; 
  size?: 'sm' | 'md' | 'lg' 
})
```

---

## Requirements

### 1. Profile Modal Component
สร้าง Reusable Modal Component (`ProfileModal.tsx`)

**Modal แสดง:**
- รูป Profile ใหญ่ (center)
- ชื่อ Display Name
- ชื่อ-นามสกุล
- รหัสพนักงาน
- สถานะ (Active/Pending)
- เบอร์โทร (มีปุ่มโทร 📞)
- Last seen / Online status

**UI Style:**
- Social media style (เหมือนหน้า `/profile` ที่ redesign แล้ว)
- Read-only (ไม่มีปุ่มแก้ไข)
- ปุ่มปิด (X) มุมขวาบน
- Click พื้นหลังเพื่อปิด

### 2. Interactive Avatar
ปรับ Avatar Component ให้:
- รับ prop `onClick` สำหรับ handle click event
- เพิ่ม cursor pointer เมื่อมี onClick
- เรียก ProfileModal เมื่อกด

### 3. Implementation Locations
เพิ่ม onClick ที่หน้า:
- `/dashboard/page.tsx` - Popup รายชื่อคนลา
- `/leader/approve/page.tsx` - รายการคนขอลา
- `/leader/history/page.tsx` - ประวัติการลา
- `/leader/drivers/page.tsx` - รายชื่อคนขับ
- `/leader/car-wash/page.tsx` - Activity feed
- `/car-wash/feed/page.tsx` - Activity feed

---

## Technical Details

### Data Structure (UserInfo)
```typescript
interface UserInfo {
  _id: string;
  lineUserId?: string;
  lineDisplayName: string;
  lineProfileImage?: string;
  name?: string;
  surname?: string;
  phone?: string;
  employeeId?: string;
  status?: 'active' | 'pending';
  lastSeen?: string;
  isOnline?: boolean;
  vacationDays?: number;
  sickDays?: number;
  personalDays?: number;
}
```

### API Endpoint
ใช้ API เดิม `/api/users?id=xxx` สำหรับดึงข้อมูล User หรือสร้างใหม่ `/api/users/[id]`

### Component Structure
```
src/
├── components/
│   ├── ProfileModal.tsx    # NEW - Modal component
│   └── Avatar.tsx          # NEW - Reusable avatar (ย้ายออกมา)
```

---

## UI Mockup

### Profile Modal
```
┌─────────────────────────────────────────┐
│  ✕                                      │
│                                         │
│           ┌─────────┐                   │
│           │    📷    │ ●                │
│           │   รูป   │                   │
│           └─────────┘                   │
│                                         │
│   สมชาย สมประเสริฐ    ✅ ใช้งาน      │
│   @line_displayname                     │
│   ● Online / Last seen 15 min ago       │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ # รหัสพนักงาน    001           │   │
│   ├─────────────────────────────────┤   │
│   │ 👤 ชื่อ-นามสกุล  สมชาย สมประเสริฐ│   │
│   ├─────────────────────────────────┤   │
│   │ 📱 เบอร์โทร     089-xxx-xxxx [📞]│   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Tasks

### Phase 1: Create Components
- [ ] สร้าง `ProfileModal.tsx` component
- [ ] สร้าง reusable `Avatar.tsx` component

### Phase 2: Integrate with Pages
- [ ] `/leader/drivers` - เพิ่ม onClick ที่ avatar
- [ ] `/leader/approve` - เพิ่ม onClick ที่ avatar
- [ ] `/leader/history` - เพิ่ม onClick ที่ avatar
- [ ] `/dashboard` - เพิ่ม onClick ที่ avatar
- [ ] `/leader/car-wash` - เพิ่ม onClick ที่ avatar
- [ ] `/car-wash/feed` - เพิ่ม onClick ที่ avatar

### Phase 3: Testing
- [ ] ทดสอบกด avatar แสดง modal
- [ ] ทดสอบปุ่มโทร
- [ ] ทดสอบปิด modal

---

## Notes
- ไม่ต้องแก้ไข Profile Page ของตัวเอง (`/profile`)
- Profile Modal เป็น Read-only
- เก็บ lastSeen ทุกครั้งที่เรียก API `/api/auth/me` (Done)
- เก็บ isOnline = false เมื่อ Logout (Done)
