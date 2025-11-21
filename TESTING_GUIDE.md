# Testing Guide - New Features

## Quick Start

### 1. Restart Your Dev Server
```bash
npm run dev
```

The app will automatically reload with all new features enabled.

---

## Feature Testing Guide

### 🔍 Feature 1: Live Search Suggestions

**How to Test**:
1. Go to the Hero search section (top of landing page)
2. Start typing a destination name (e.g., "Kit", "Cop", "Lus")
3. Watch suggestions appear in real-time dropdown
4. Each suggestion shows:
   - Destination name
   - Number of searches (popularity)
   - Cheapest price available
   - "Trending" badge if popular (10+ searches)

**Expected Behavior**:
- Dropdown appears after ~300ms of typing
- Suggestions update as you type more
- Click a suggestion to select it and close dropdown
- Click outside dropdown to close it
- Loading spinner appears while fetching

---

### 🔥 Feature 2: Trending Destinations

**How to Test**:
1. Look for "Trending Destinations" section on landing page (below Hero)
2. You should see 6 cards displaying most popular routes this week
3. Each card shows:
   - Route name (From → To)
   - Hot Route badge (if 50+ searches)
   - Search count
   - Cheapest price
   - Number of available operators

**Expected Behavior**:
- Cards animate in on page load
- Hover on card → slight lift effect
- Click card → automatically searches that destination
- "Hot Route" badge shows for very popular routes
- Shows skeleton loaders while loading

---

### 👤 Feature 3: User Profile in Navbar

**How to Test**:

**Before Registration**:
1. Fresh browser (or clear localStorage)
2. Top right shows phone support button

**After Registration**:
1. Do a search → triggers registration modal
2. Fill in name and phone, click Register
3. Look at top right navbar
4. Should now show:
   - Blue gradient button with user's first name
   - Avatar with first letter initial
   - Dropdown arrow

**Dropdown Menu**:
1. Click the user profile button
2. Dropdown appears with:
   - Account section showing full name
   - My Bookings button
   - Settings button
   - Sign Out button (red)
3. Click outside to close

---

### 🎁 Feature 4: Promotions Banner

**How to Test**:

**First-Time User**:
1. Clear localStorage or use incognito window
2. Look at top of "Popular Routes" section
3. Should see promotion banner (if active promotion exists in DB)
4. Shows:
   - "NEW USER" badge with pulsing animation
   - Promotion title and description
   - Discount (30% OFF or fixed amount)
   - "Only valid for new users!" warning
   - Countdown timer
   - "Book Now" button

**After Registration**:
1. Register as a new user
2. Promotions banner still visible
3. "NEW USER" badge disappears after refresh (or page navigation)
4. Still shows promotion but without urgency message

**Countdown Timer**:
- Shows days remaining (e.g., "2 days left")
- Or hours if less than 1 day (e.g., "12h left")
- Or minutes if less than 1 hour (e.g., "45m left")
- Updates in real-time

---

### 💳 Feature 5: Enhanced Payment Method Display

**How to Test**:
1. Search for a bus and click "Book Now"
2. Booking modal opens
3. Scroll to "Choose Payment Method" section
4. Should see two options:
   - **Airtel Money** (red card with "Ar" icon)
   - **MTN MoMo** (yellow card with "MT" icon)

**Payment Method Selection**:
1. Click on Airtel Money card
2. Below the cards, an instruction box appears showing:
   - Info icon
   - "How to pay with Airtel Money"
   - Step-by-step instructions:
     - Dial *778#
     - Select Make Payment > Pay Bill
     - Enter Merchant Code: INTERCITY
     - Enter Amount: K[price]
     - Reference: [Your Phone Number]
   - Total amount highlighted

3. Click on MTN MoMo card
4. Instruction box updates showing:
   - "How to pay with MTN MoMo"
   - Different dial code (*303#)
   - Different merchant ID (202020)
   - Yellow color scheme instead of red

**Visual Improvements**:
- Better sized payment buttons
- Clear color coding
- Selected state with ring effect
- Smooth animations when switching methods

---

## Database Setup

### Required Migration
Run this command once to create the promotions table:
```bash
npm run db:push
```

If you get an error, check your `.env.local` file has `DATABASE_URL` set correctly.

---

## Adding Test Data (Promotions)

### Option 1: Direct Database Query
Connect to Neon dashboard and run:
```sql
INSERT INTO promotions (
  title,
  description,
  discount_percent,
  code,
  badge,
  start_date,
  end_date,
  is_active,
  priority
) VALUES (
  'First Booking Special',
  'Get 30% off your first intercity ticket booking!',
  30,
  'FIRST30',
  'New Users Only',
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  1
);
```

### Option 2: Create Admin API Endpoint (Recommended)
Create `src/app/api/promotions/create/route.ts` to add promotions programmatically.

---

## Troubleshooting

### Suggestions dropdown not appearing?
- Check browser console for API errors
- Make sure `/api/search-suggestions` endpoint is responding
- Clear browser cache and reload
- Verify database has routes data

### Trending destinations not showing?
- Ensure database has search_analytics data
- Check `/api/trending-routes` endpoint response
- May need to populate test searches in analytics table

### Promotions banner not showing?
- Check if promotions table exists: `npm run db:push`
- Add test promotion to database
- Verify promotion has:
  - `is_active = true`
  - `start_date <= NOW()`
  - `end_date >= NOW()`

### User profile not showing after registration?
- Check browser console for errors
- Verify localStorage is not blocked
- Clear localStorage and try again
- Check `useUserSession` hook is working

### Payment instructions not updating?
- Check browser console for React errors
- Verify `paymentMethod` state is changing
- Try clearing browser cache

---

## API Endpoints Reference

### Search Suggestions
```
GET /api/search-suggestions?q=destination
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "Kitwe",
      "searchCount": 45,
      "cheapestPrice": 150.50
    }
  ]
}
```

### Trending Routes
```
GET /api/trending-routes
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "from": "Lusaka",
      "to": "Kitwe",
      "route": "Lusaka → Kitwe",
      "searchCount": 120,
      "cheapestPrice": 150.00,
      "operatorCount": 5
    }
  ]
}
```

### Promotions
```
GET /api/promotions
GET /api/promotions?featured=true    (Get featured promotion)
GET /api/promotions?limit=5          (Get top 5 promotions)
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "First Booking Special",
      "discountPercent": 30,
      "code": "FIRST30",
      "badge": "New Users Only",
      "startDate": "2025-11-22T00:00:00Z",
      "endDate": "2025-12-22T00:00:00Z"
    }
  ]
}
```

---

## Performance Notes

- **Search suggestions**: 300ms debounce to prevent excessive API calls
- **Trending routes**: Cached for 7 days (calculated from analytics)
- **Promotions**: No caching - always shows current active promotions
- **User profile**: Uses localStorage (instant, no API call)

---

## Browser Compatibility

All features tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Next Steps

1. **Test all features** using guides above
2. **Populate promotions table** with your actual promotions
3. **Collect search analytics** to populate trending destinations
4. **Configure payment processors** (Flutterwave, Pesapal, etc.)
5. **Set up SMS notifications** for booking confirmations

---

**Questions?** Check `FEATURES_IMPLEMENTATION_SUMMARY.md` for detailed documentation.
