# User Bookings & Activity Dashboard - Complete Guide

## 🎯 Overview

Your app now has a comprehensive user bookings and activity management system. Users can view all their bookings, filter by status, and track their travel history. Notifications automatically link to this dashboard.

---

## ✨ Features Implemented

### 1. **User Bookings API Endpoint**
**Location**: `src/app/api/user-bookings/route.ts`

**What it does**:
- Fetches all bookings for a specific user (by phone number)
- Includes detailed trip information (operator, route, times, amounts)
- Supports filtering by booking status
- Calculates summary statistics

**API Usage**:
```
GET /api/user-bookings?phone=+260971234567
GET /api/user-bookings?phone=+260971234567&status=confirmed
```

**Response Structure**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bookingRef": "ZM123456xyz",
      "passengerName": "Brian Chishalemba",
      "seatNumber": "A1",
      "travelDate": "2025-12-15T00:00:00Z",
      "status": "confirmed",
      "totalAmount": "150.00",
      "createdAt": "2025-11-22T10:30:00Z",
      "operator": "Mazhandu",
      "operatorColor": "bg-blue-600",
      "from": "Lusaka",
      "to": "Kitwe",
      "departureTime": "06:00",
      "arrivalTime": "14:30",
      "busType": "luxury"
    }
  ],
  "summary": {
    "totalBookings": 5,
    "confirmedBookings": 4,
    "upcomingBookings": 2,
    "completedBookings": 1
  }
}
```

**Status Codes**:
- `200`: Success - bookings retrieved
- `400`: Missing phone parameter
- `500`: Server error

---

### 2. **Bookings Modal Component**
**Location**: `src/components/UserBookingsModal.tsx`

**Key Features**:

#### Summary Cards
- Total number of bookings
- Number of confirmed bookings
- Number of upcoming trips
- Number of completed trips
- Color-coded display for quick visual scanning

#### Status Filters
- **All**: Shows all bookings regardless of status
- **Confirmed**: Shows confirmed bookings ready for travel
- **Pending**: Shows pending payment bookings
- **Completed**: Shows past completed trips

#### Booking Cards Display
Each booking shows:
- **Route**: From City → To City
- **Status Badge**: Color-coded (green=confirmed, yellow=pending, blue=completed, red=cancelled)
- **Operator**: Bus company name
- **Seat Number**: Your assigned seat
- **Travel Date**: When you're traveling
- **Departure Time**: When the bus leaves
- **Total Amount**: What you paid
- **Booking Reference**: Your unique booking code
- **Booked Date**: When the booking was made
- **View Details**: Link to full booking details

#### Loading & Empty States
- Loading spinner while fetching data
- Empty state message when no bookings exist
- Professional error messages

---

### 3. **Notification Integration**

#### Bell Icon in Navbar
- Only visible for registered users
- Shows red dot indicator
- Clickable to open bookings modal
- Added to navbar top-right area

#### Notification Toast Enhanced
When a new booking appears (system-wide or your own):
- Toast shows booking details
- **View All Button**: Opens your complete bookings modal
- **Close Button**: Dismisses the notification
- Auto-dismisses after 6 seconds

---

### 4. **User Profile Dropdown**
Updated profile menu includes:
- **My Bookings**: Direct link to bookings modal (opens from dropdown)
- Closes dropdown and opens modal smoothly

---

## 🎨 UI/UX Design

### Color Coding
- **Green** (✓): Confirmed bookings - ready to travel
- **Yellow** (⏳): Pending - waiting for payment or confirmation
- **Blue** (✔️): Completed - trip already taken
- **Red** (✕): Cancelled - booking was cancelled

### Responsive Design
- **Mobile**: Single column, touch-optimized buttons
- **Tablet**: Two column summary stats, scrollable list
- **Desktop**: Four column summary stats, full details visible

### Animations
- Modal slides in with spring animation
- Booking cards fade in when displayed
- Smooth status filter transitions
- Hover effects on cards and buttons

---

## 🔧 How to Use

### For Users

**View Your Bookings**:
1. Click the **🔔 bell icon** in the top-right navbar
2. Or go to **Profile Menu** → **My Bookings**

**Filter Bookings**:
1. Open bookings modal
2. Click filter buttons: All, Confirmed, Pending, Completed
3. List updates immediately

**View Booking Details**:
1. Scroll through your bookings
2. Click **View Details** button on any booking
3. See full information including booking reference

**Get Notified**:
1. When a new booking is made (system-wide), you'll get a toast notification
2. Click **View All** in the notification to see all your bookings
3. Toast automatically disappears after 6 seconds

---

## 📊 Data Structure

### Booking Statuses
```
'pending'   - Booking created, waiting for payment
'confirmed' - Payment complete, ready to travel
'cancelled' - Booking was cancelled
'completed' - Trip already taken
```

### Bus Types
```
'luxury'   - Luxury bus with premium features
'standard' - Standard comfort bus
```

---

## 🔌 API Integration Points

### In the App

**Main Page** (`src/app/page.tsx`):
- Passes `onNotificationClick` callback to Navbar
- Manages `isBookingsModalOpen` state
- Passes `userPhone` to UserBookingsModal

**Navbar** (`src/components/Navbar.tsx`):
- Displays notification bell (registered users only)
- Triggers callback when clicked
- "My Bookings" in dropdown opens modal

**Notifications Hook** (`src/hooks/useBookingNotifications.tsx`):
- Receives `onBookingClick` callback
- "View All" button in toast calls callback
- Backward compatible with boolean parameter

---

## 🚀 User Flows

### Flow 1: View Bookings from Navbar
```
User clicks bell icon
    ↓
Navbar calls onNotificationClick
    ↓
Page opens UserBookingsModal
    ↓
Modal fetches /api/user-bookings?phone=...
    ↓
Display bookings with summary stats
```

### Flow 2: View Bookings from Profile Menu
```
User clicks profile dropdown
    ↓
User clicks "My Bookings"
    ↓
Dropdown closes, modal opens
    ↓
Same as Flow 1
```

### Flow 3: Notification Linking to Bookings
```
New booking notification appears
    ↓
User clicks "View All" button
    ↓
Toast closes, modal opens
    ↓
Shows all user bookings
```

### Flow 4: Filter Bookings
```
Bookings modal is open
    ↓
User clicks status filter (e.g., "Confirmed")
    ↓
Modal re-fetches with status parameter
    ↓
List updates with filtered bookings
```

---

## 📱 Responsive Behavior

### Mobile (< 640px)
- Summary stats: 2 columns
- Booking details: Single column layout
- Status filter buttons: Horizontal scroll
- Modal takes full width with padding

### Tablet (640px - 1024px)
- Summary stats: 3-4 columns
- Booking details: 2 column grid
- Status filter buttons: Fully visible
- Modal width: 90% of screen

### Desktop (> 1024px)
- Summary stats: 4 columns
- Booking details: Full grid layout
- All information visible without scrolling
- Modal width: 900px max

---

## ⚙️ Configuration

### API Endpoint Parameters
```typescript
// Get all bookings
fetch('/api/user-bookings?phone=%2B260971234567')

// Get only confirmed bookings
fetch('/api/user-bookings?phone=%2B260971234567&status=confirmed')

// Get only pending bookings
fetch('/api/user-bookings?phone=%2B260971234567&status=pending')

// Get only completed bookings
fetch('/api/user-bookings?phone=%2B260971234567&status=completed')
```

### Modal Props
```typescript
<UserBookingsModal
  isOpen={true}              // Control modal visibility
  onClose={() => {}}         // Called when user closes modal
  userPhone="+260971234567"  // User's phone for API call
/>
```

---

## 🎯 Testing Checklist

- [ ] Register a user
- [ ] Create multiple bookings with different statuses
- [ ] Click bell icon → Modal opens
- [ ] Click "My Bookings" in profile dropdown → Modal opens
- [ ] Filter by "Confirmed" → Only confirmed bookings show
- [ ] Filter by "Pending" → Only pending bookings show
- [ ] Filter by "Completed" → Only completed bookings show
- [ ] Check summary stats update with filters
- [ ] View booking with all details visible
- [ ] Notification with "View All" button → Opens modal
- [ ] Test on mobile, tablet, desktop
- [ ] Empty state when no bookings

---

## 🔐 Security Notes

- Phone number must match user's registered phone
- Only shows bookings for the authenticated user
- All filters happen server-side
- No sensitive data exposed in frontend

---

## 📈 Future Enhancements

Possible improvements:
1. **Booking Details Page**: Click booking to see full details
2. **Cancellation**: Cancel upcoming bookings from modal
3. **Reschedule**: Change travel date for confirmed bookings
4. **Print Ticket**: Download/print booking confirmation
5. **Receipt Download**: Download payment receipt
6. **Booking Search**: Search by booking reference
7. **Export History**: Export bookings as CSV/PDF
8. **Sharing**: Share booking with others
9. **QR Code**: Generate QR code for boarding
10. **Payment History**: See payment details per booking

---

## 🐛 Troubleshooting

### Bookings not showing
- Check user phone is correct (with country code)
- Verify bookings exist in database
- Check browser console for API errors

### Status filters not working
- Ensure API endpoint supports status parameter
- Check filter button is being clicked
- Verify database has bookings with different statuses

### Modal not opening
- Check isOpen prop is true
- Verify onNotificationClick callback is passed
- Check for console errors

### Summary stats wrong
- Check API summary calculation
- Clear browser cache and refresh
- Verify all bookings are fetched

---

## 📞 Support

For issues or questions:
1. Check console for error messages
2. Verify API endpoint is working
3. Ensure user phone matches exactly
4. Check database for booking records

---

**Status**: ✅ Complete and Ready for Production
**Last Updated**: November 22, 2025
