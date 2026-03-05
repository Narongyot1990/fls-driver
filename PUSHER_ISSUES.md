# Pusher Real-time ไม่ทำงาน - Pain Points Document

## สรุปปัญหา
Pusher trigger จาก server-side ไม่ทำงาน แม้ว่า client-side subscription จะทำงานได้ปกติ

## Environment Variables ที่ต้องใช้

| Variable | ค่า |
|----------|-----|
| `PUSHER_APP_ID` | `2122262` |
| `PUSHER_KEY` | `f06f65425e73a95938a6` |
| `PUSHER_SECRET` | `0cf1269dde00a466f2e0` (ต้องได้จาก Pusher Dashboard) |
| `PUSHER_CLUSTER` | `ap1` |
| `NEXT_PUBLIC_PUSHER_KEY` | `f06f65425e73a95938a6` |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | `ap1` |

## Pain Points

### 1. 401 Error - Invalid Signature
- **อาการ**: `PusherRequestError: Unexpected status code 401` with `Invalid signature`
- **สาเหตุ**: 
  - `PUSHER_SECRET` ใน Vercel ไม่ถูกต้อง (อาจมี whitespace หรือ secret ไม่ตรงกับ key)
  - Vercel CLI มีปัญหากับการ input secret ที่มี newline ติดมาด้วย
- **การแก้**: 
  - ลบ `PUSHER_SECRET` ใน Vercel Dashboard แล้วสร้างใหม่ด้วยตนเอง
  - หรือต้องหา way ที่จะ input secret โดยไม่มี whitespace

### 2. Pusher Package Version ไม่ compatible กับ Vercel
- **v5.3.2**: 401 Error (signature ไม่ตรง)
- **v4.0.0**: TypeError: `d is not a function` (API เปลี่ยน)
- **การแก้**: ต้องหา version ที่ work กับ Vercel หรือใช้วิธีอื่น

### 3. ไม่สามารถ Debug ได้ง่าย
- Secret เป็น encrypted ใน Vercel ไม่เห็นค่าจริง
- ไม่มี way ง่ายๆ ที่จะ log ว่า secret ที่ส่งไปถูกต้องหรือไม่

## Files ที่เกี่ยวข้อง

### Server-side (trigger events)
- `src/lib/pusher.ts` - สร้าง Pusher instance สำหรับ server
- `src/app/api/car-wash/route.ts` - trigger `new-activity`
- `src/app/api/car-wash/[id]/route.ts` - trigger `update-activity`, `delete-activity`
- `src/app/api/leave/route.ts` - trigger `new-leave-request`
- `src/app/api/leave/[id]/route.ts` - trigger leave status changes

### Client-side (subscribe events)
- `src/lib/pusher-client.ts` - singleton Pusher instance สำหรับ client
- `src/app/car-wash/feed/page.tsx` - subscribe `car-wash-feed` channel
- `src/app/leave/page.tsx` - subscribe `driver-{userId}` channel
- `src/app/leader/approve/page.tsx` - subscribe `leave-requests` channel
- `src/app/leader/home/page.tsx` - subscribe `leave-requests` channel
- `src/app/leader/car-wash/page.tsx` - subscribe `car-wash-feed` channel

## วิธีแก้ที่แนะนำ

1. **ตรวจสอบ Pusher credentials อีกครั้ง**
   - ไปที่ https://dashboard.pusher.com → Apps → 2122262
   - ตรวจสอบว่า key/secret ตรงกัน
   - ถ้าไม่แน่ใจ ให้ regenerate ใหม่ทั้งคู่

2. **ลองใช้ pusher-js แทน pusher สำหรับ server-side**
   - เปลี่ยนจาก `import { pusher } from '@/lib/pusher'` เป็นใช้ Pusher from `pusher-js` ใน API routes
   - หรือลองใช้ HTTP request ไปที่ Pusher REST API โดยตรง

3. **เพิ่ม debug logging**
   - Log Pusher config ใน server-side ก่อน trigger (แต่ต้องระวังไม่ให้ log secret)

4. **Alternative: ใช้ polling แทน real-time**
   - ถ้า Pusher ยังไม่ทำงาน อาจใช้วิธี refresh หลังจาก action สำเร็จ
