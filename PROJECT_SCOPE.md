# ITL Leave Management System - Project Scope & Roadmap

## 1. Project Overview

**ชื่อโปรเจกต์:** ITL Leave Management System  
**ประเภท:** Web Application (Mobile-First)  
**Tech Stack:** Next.js 16 + Vercel + MongoDB Atlas + LINE Login  

---

## 2. Project URL

- **Production:** https://drivers-tau.vercel.app
- **MongoDB:** driver-request (Atlas Cluster)

---

## 3. Features Summary

### Driver Features
- Login ด้วย LINE
- ขอลา (ลาพักร้อน, ลาป่วย, ลากิจ, ลากิจไม่ได้รับค่าจ้าง)
- ดูประวัติการลา
- แก้ไขข้อมูลส่วนตัว (phone, employeeId)

### Leader Features
- Login ด้วย Email + Password
- ดูรายการขอลาของพนักงาน
- อนุมัติ/ไม่อนุมัติ คำขอลา
- Filter ประวัติ (ตามประเภท, สถานะ, วันที่, พนักงาน)
- สร้างรายการแทนพนักงาน

---

## 4. Database Schema

### users (Driver - from LINE)
```javascript
{
  _id: ObjectId,
  lineUserId: String (unique),
  lineDisplayName: String,
  lineProfileImage: String,
  role: "driver",
  phone: String,
  employeeId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### leaders (Leader - manual)
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: "leader",
  createdAt: Date
}
```

### leave_requests
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  leaveType: "vacation" | "sick" | "personal" | "unpaid",
  startDate: Date,
  endDate: Date,
  reason: String,
  status: "pending" | "approved" | "rejected",
  approvedBy: ObjectId (ref: leaders),
  approvedAt: Date,
  createdAt: Date
}
```

### substitute_records
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  recordType: "vacation" | "sick" | "personal" | "unpaid" | "absent" | "late" | "accident" | "damage",
  description: String,
  date: Date,
  createdBy: ObjectId (ref: leaders),
  createdAt: Date
}
```

---

## 5. API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/line` | LINE OAuth callback |
| POST | `/api/auth/leader/login` | Leader login |
| POST | `/api/auth/leader/logout` | Logout |

### Leave
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leave` | ดูรายการลา (filter) |
| POST | `/api/leave` | สร้างคำขอลา |
| PATCH | `/api/leave/[id]` | อนุมัติ/ไม่อนุมัติ |

### Substitute
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/substitute` | ดูรายการแทน |
| POST | `/api/substitute` | สร้างรายการแทน |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | ดูโปรไฟล์ |
| PATCH | `/api/user/profile` | แก้ไขโปรไฟล์ |

---

## 6. Pages Structure

```
/                           → Redirect by role
/login                      → LINE Login (Driver)
/leader/login               → Email/Password (Leader)

/home                       → Dashboard (Driver)
/leave                      → ขอลา
/leave/history              → ประวัติการลา
/settings                   → แก้ไขข้อมูล

/leader/home                → Dashboard (Leader)
/leader/approve              → รายการรออนุมัติ
/leader/history             → ประวัติทั้งหมด (filter)
/leader/substitute          → สร้างรายการแทน
```

---

## 7. Roadmap

### Phase 1: Setup & Auth (Current)
- [x] Initialize Next.js project
- [x] Setup MongoDB connection
- [x] Create LINE Channel & env config
- [ ] Implement LINE Login
- [ ] Implement Leader login
- [ ] Create seed script for leader accounts

### Phase 2: Driver Features
- [ ] Home page (Driver)
- [ ] Leave request form
- [ ] Leave history page
- [ ] Profile settings page

### Phase 3: Leader Features
- [ ] Approval list page
- [ ] Approve/Reject functionality
- [ ] Filter system
- [ ] Substitute record page

### Phase 4: Polish
- [ ] Mobile UI/UX optimization
- [ ] Bottom navigation
- [ ] Error handling
- [ ] Loading states

---

## 8. Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# LINE Login
LINE_CHANNEL_ID=2009288720
LINE_CHANNEL_SECRET=770b1ecf85142c8938988900c9e3fe6c
LINE_REDIRECT_URI=https://drivers-tau.vercel.app/api/auth/line/callback

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://drivers-tau.vercel.app
```

---

## 9. Prerequisites Checklist

- [x] Vercel Account
- [x] Vercel Project (drivers)
- [x] MongoDB Atlas Cluster (driver-request)
- [x] LINE Developer Account
- [x] LINE Login Channel (Channel ID: 2009288720)
