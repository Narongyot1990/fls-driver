# Moments Feature - Requirements

## Overview
Enhance the driver Moments/Car-wash feature with better UX and real-time functionality.

## 1. Date/Time Picker - Apply Consistent Format

**Location:** `src/app/car-wash/page.tsx`

**Current:** Uses native HTML `<input type="date">` and `<select>` for time

**Required:** Use the existing `DatePickerModal` component (`src/components/DatePickerModal.tsx`) for date selection to maintain consistency with other pages (e.g., leave request).

- When user taps date field, open DatePickerModal
- After selecting date from modal, update the `activityDate` state
- Keep time selection as dropdown or convert to modal as well

## 2. Loading Modal After Submit

**Location:** `src/app/car-wash/page.tsx`

**Issue:** After clicking submit, no loading indicator shown - users are confused if save is in progress

**Required:** Show loading modal/spinner when `loading` state is true and form is being submitted

## 3. Redirect to Feed After Submit

**Location:** `src/app/car-wash/page.tsx`

**Current:** Shows success message and stays on create page

**Required:** After successful submission, redirect to `/car-wash/feed` automatically

## 4. Infinite Scroll - Load More Posts

**Location:** `src/app/car-wash/feed/page.tsx`

**Current:** Loads all posts at once

**Required:**
- Load initial 10 posts (newest first) from API
- When user scrolls to bottom, load next 10 posts
- Continue loading in batches of 10 until all posts are loaded
- Show loading indicator during fetch

**API Changes:**
- Add pagination to `/api/car-wash/route.ts` GET endpoint
- Accept `limit` and `skip` or `page` query parameters
- Return total count for "load more" logic

## 5. Filter - Show My Posts Only

**Location:** `src/app/car-wash/feed/page.tsx`

**Current:** Filter by activity type only

**Required:** Add filter option to show only posts created by current logged-in driver

- Add "ของฉัน" (My posts) filter button
- When selected, fetch only posts where `userId === currentUser.id`

## 6. Post Display - Better Date/Time Info

**Location:** `src/app/car-wash/feed/page.tsx`

**Current:** Shows `{dayjs(activity.createdAt).fromNow()} · {activity.activityTime} น.`

**Required:** Improve date/time display in each post:

- Show "วันที่ทำกิจกรรม" (activityDate) + "เวลา" (activityTime) prominently
- Show "โพสต์เมื่อ" (createdAt) as secondary info in smaller text
- Example design:
  ```
  [Avatar] ชื่อผู้ใช้
         ล้างรถ · 15 ม.ค. 2025 เวลา 14:30 น.
         โพสต์เมื่อ 2 ชั่วโมงที่แล้ว
  ```

## 7. Pusher Console Errors

**Issue:** Console shows red warning messages related to Pusher/SockJS

**Likely Cause:** Missing Pusher configuration in `.env.local`

**Pusher Credentials:**
```
PUSHER_APP_ID=2122262
PUSHER_KEY=a0801e847a64a2cae467
PUSHER_SECRET=2f76e271d3a0b863a74a
PUSHER_CLUSTER=ap1
NEXT_PUBLIC_PUSHER_KEY=a0801e847a64a2cae467
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

**Required - Add to `.env.local`:**
```env
NEXT_PUBLIC_PUSHER_KEY=a0801e847a64a2cae467
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
PUSHER_APP_ID=2122262
PUSHER_KEY=a0801e847a64a2cae467
PUSHER_SECRET=2f76e271d3a0b863a74a
PUSHER_CLUSTER=ap1
```

**Required - Add to Vercel Project Settings:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all the Pusher variables above
3. Redeploy to apply new configuration

## 8. Real-time Updates Not Working

**Issue:** When someone posts or performs action, must refresh to see updates despite having Pusher

**Location:** `src/app/car-wash/feed/page.tsx`

**Current Pusher Setup:**
```typescript
const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
});
const channel = pusherClient.subscribe('car-wash-feed');
```

**Required:**
- Debug why Pusher events not being received
- Ensure client subscribes to correct channel name matching server (`car-wash-feed` - confirmed matches)
- Check if Pusher authentication is required
- Ensure event binding works correctly

**Troubleshooting Steps:**
1. Verify Pusher credentials in environment
2. Check browser console for connection errors
3. Verify server-side trigger uses correct channel
4. Add debug logging for Pusher events

## Files to Modify

1. `src/app/car-wash/page.tsx` - Create page improvements (items 1-3)
2. `src/app/car-wash/feed/page.tsx` - Feed page improvements (items 4-6, 8)
3. `src/app/api/car-wash/route.ts` - Add pagination to GET endpoint
4. `.env.local` - Add Pusher configuration (item 7)
5. Vercel Project Settings - Add Pusher variables for production (item 7)

## Acceptance Criteria

- [ ] Date picker in create page uses DatePickerModal
- [ ] Loading modal shows during submission
- [ ] Redirects to feed after successful save
- [ ] Feed loads 10 posts initially, loads more on scroll
- [ ] "ของฉัน" filter shows only current user's posts
- [ ] Post displays activity date/time prominently
- [ ] No Pusher console errors
- [ ] Real-time updates work without manual refresh
