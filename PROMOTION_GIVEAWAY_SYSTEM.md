# Promotion Giveaway System Setup Guide

## Overview

The InterCity Bookings platform now has a fully functional promotion giveaway system that allows:
- **Automatic promotional giveaways** created via cron jobs on your VPS
- **Real-time entries** from users participating in promotions
- **Automated winner drawing** at scheduled times
- **Agent dashboard** to manage and interact with promotions and ticket requests
- **Frontend display** of active promotions and giveaways

## Architecture

### Components

1. **Database Layer** (Neon PostgreSQL)
   - `promotion_giveaways` - stores promotion details
   - `giveaway_entries` - user entries for each giveaway
   - `giveaway_winners` - drawn winners and claim status

2. **VPS Scheduler** (EC2 Ubuntu)
   - `promotion-scheduler-pg.js` - manages promotion lifecycle
   - Crontab jobs for automatic execution

3. **API Layer** (Next.js)
   - `/api/giveaways` - fetch and enter giveaways
   - `/api/agent/dashboard` - agent ticket requests & giveaway management

4. **Frontend** (React/Next.js)
   - Promotional banners & cards
   - Entry forms for users
   - Agent dashboard interface

## VPS Setup Status

### Database Connection
✅ **Connected to Neon Database**
- Host: `ep-flat-dawn-ae5ao2h2-pooler.c-2.us-east-2.aws.neon.tech`
- Database: `neondb`
- Credentials: Stored in `/home/ubuntu/.env`

### Database Tables
✅ **Tables Created:**
- `promotion_giveaways` (3 tables for giveaway system)
- `giveaway_entries`
- `giveaway_winners`

### Scheduler Scripts
✅ **Scripts Deployed:**
- `/home/ubuntu/promotion-scheduler-pg.js` - Main scheduler
- `/home/ubuntu/install-schema-pg.mjs` - Schema installer

### Crontab Configuration
✅ **Jobs Active:**
```
# Promotion Scheduler - runs every 30 minutes (for testing)
*/30 * * * * cd /home/ubuntu && /usr/bin/node promotion-scheduler-pg.js >> /home/ubuntu/promotion-scheduler.log 2>&1

# Draw winners daily at 6 PM
0 18 * * * cd /home/ubuntu && /usr/bin/node promotion-scheduler-pg.js >> /home/ubuntu/promotion-scheduler.log 2>&1

# Activate promotions daily at midnight
0 0 * * * cd /home/ubuntu && /usr/bin/node promotion-scheduler-pg.js >> /home/ubuntu/promotion-scheduler.log 2>&1
```

**Note:** The promotion creation is set to every 30 minutes for testing. To change to production mode (every 3 days), update crontab:
```bash
ssh -i /path/to/key ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com
# Edit crontab
crontab -e
# Change: */30 * * * * → 0 2 */3 * *
```

## API Endpoints

### 1. Fetch Active Giveaways
**GET** `/api/giveaways`

Query Parameters:
- `limit` (optional, default: 10) - max number of giveaways
- `status` (optional) - filter by 'active', 'upcoming', 'drawn', 'completed'

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Free Bus Ticket Giveaway",
      "description": "Win a free intercity bus ticket",
      "prizeType": "free_ticket",
      "prizeValue": 500,
      "startDate": "2025-11-21T00:00:00.000Z",
      "endDate": "2025-11-27T00:00:00.000Z",
      "drawDate": "2025-11-28T00:00:00.000Z",
      "status": "active",
      "winnersCount": 3,
      "totalEntries": 45,
      "daysRemaining": 6
    }
  ],
  "count": 1
}
```

### 2. Enter a Giveaway
**POST** `/api/giveaways`

Request Body:
```json
{
  "giveawayId": 1,
  "userPhone": "+260970000000",
  "bookingId": null
}
```

Response:
```json
{
  "success": true,
  "data": {
    "entryId": 123,
    "message": "Successfully entered the giveaway!"
  }
}
```

### 3. Agent Dashboard - Get Data
**GET** `/api/agent/dashboard`

Query Parameters:
- `agentPhone` (required) - agent's phone number
- `timeWindow` (optional, default: 24) - hours of data to show
- `includeGiveaways` (optional, default: true)
- `includeTicketRequests` (optional, default: true)

Response:
```json
{
  "success": true,
  "data": {
    "agentPhone": "+260970000000",
    "timeWindow": 24,
    "generatedAt": "2025-11-21T23:58:00.000Z",
    "ticketRequests": [
      {
        "id": 1,
        "bookingRef": "BK20251121001",
        "passengerName": "John Doe",
        "passengerPhone": "+260970000001",
        "status": "pending",
        "totalAmount": 450,
        "travelDate": "2025-11-22T10:00:00.000Z",
        "hoursAgo": 2,
        "interactionWindow": {
          "open": true,
          "expiresAt": "2025-11-24T02:00:00.000Z",
          "hoursRemaining": 70
        }
      }
    ],
    "activeGiveaways": [
      {
        "id": 1,
        "title": "Free Bus Ticket",
        "prizeType": "free_ticket",
        "status": "active",
        "totalEntries": 45,
        "totalWinners": 0,
        "unclaimedPrizes": 0,
        "interactionWindow": {
          "open": true,
          "closeDate": "2025-11-27T23:59:59.000Z",
          "hoursRemaining": 120,
          "drawsIn": 144
        },
        "recentEntries": [
          {
            "userPhone": "+260970000000",
            "entryDate": "2025-11-21T23:50:00.000Z",
            "winner": false,
            "claimed": false
          }
        ]
      }
    ],
    "stats": {
      "totalTicketsInWindow": 15,
      "totalGiveawayEntries": 250,
      "pendingInteractions": 12
    }
  }
}
```

### 4. Agent Dashboard - Mark Prize as Claimed
**PUT** `/api/agent/dashboard`

Request Body:
```json
{
  "action": "claim_prize",
  "winnerId": 5,
  "agentPhone": "+260970000000"
}
```

Or record ticket interaction:
```json
{
  "action": "interact_ticket",
  "ticketId": 123,
  "agentPhone": "+260970000000"
}
```

## Database Schema (Local)

### Updated schema.ts
The following tables have been added to `/src/db/schema.ts`:

```typescript
export const promotionGiveaways = pgTable('promotion_giveaways', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  prizeType: varchar('prize_type', { length: 100 }).notNull(),
  prizeDetails: text('prize_details'),
  prizeValue: decimal('prize_value', { precision: 10, scale: 2 }),
  drawDate: timestamp('draw_date').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 20 }).default('upcoming'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const giveawayEntries = pgTable('giveaway_entries', {
  id: serial('id').primaryKey(),
  giveawayId: integer('giveaway_id').references(() => promotionGiveaways.id).notNull(),
  userPhone: varchar('user_phone', { length: 20 }).notNull(),
  bookingId: integer('booking_id'),
  winner: boolean('winner').default(false),
  claimed: boolean('claimed').default(false),
  entryDate: timestamp('entry_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const giveawayWinners = pgTable('giveaway_winners', {
  id: serial('id').primaryKey(),
  giveawayId: integer('giveaway_id').references(() => promotionGiveaways.id).notNull(),
  entryId: integer('entry_id').references(() => giveawayEntries.id).notNull(),
  userPhone: varchar('user_phone', { length: 20 }).notNull(),
  claimCode: varchar('claim_code', { length: 50 }).unique(),
  claimed: boolean('claimed').default(false),
  claimedDate: timestamp('claimed_date'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## Frontend Integration

### Displaying Active Giveaways
```typescript
import { useEffect, useState } from 'react';

export function GiveawayBanner() {
  const [giveaways, setGiveaways] = useState([]);

  useEffect(() => {
    fetch('/api/giveaways?limit=5')
      .then(res => res.json())
      .then(data => setGiveaways(data.data));
  }, []);

  return (
    <div>
      {giveaways.map(g => (
        <div key={g.id}>
          <h3>{g.title}</h3>
          <p>Prize: K{g.prizeValue}</p>
          <p>Days Left: {g.daysRemaining}</p>
          <button onClick={() => enterGiveaway(g.id)}>
            Enter Now ({g.totalEntries} entries)
          </button>
        </div>
      ))}
    </div>
  );
}

async function enterGiveaway(giveawayId: number) {
  const userPhone = localStorage.getItem('userPhone');

  const response = await fetch('/api/giveaways', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      giveawayId,
      userPhone,
    }),
  });

  const result = await response.json();
  if (result.success) {
    alert('Successfully entered the giveaway!');
  }
}
```

### Agent Dashboard
```typescript
export function AgentDashboard({ agentPhone }: { agentPhone: string }) {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetch(`/api/agent/dashboard?agentPhone=${agentPhone}`)
      .then(res => res.json())
      .then(data => setDashboardData(data.data));
  }, [agentPhone]);

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Agent Dashboard</h2>

      <section>
        <h3>Ticket Requests ({dashboardData.stats.totalTicketsInWindow})</h3>
        {dashboardData.ticketRequests.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <p>{ticket.bookingRef} - {ticket.passengerName}</p>
            <p>Interaction Window: {ticket.interactionWindow.hoursRemaining}h remaining</p>
          </div>
        ))}
      </section>

      <section>
        <h3>Active Giveaways</h3>
        {dashboardData.activeGiveaways.map(giveaway => (
          <div key={giveaway.id} className="giveaway-card">
            <h4>{giveaway.title}</h4>
            <p>Entries: {giveaway.totalEntries}</p>
            <p>Draw in: {giveaway.interactionWindow.drawsIn}h</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

## Interaction Windows

### Ticket Request Interaction Window
- **Duration:** 72 hours from booking creation
- **Purpose:** Agents have 72 hours to follow up on a ticket request
- **Status:** Shown in API response with remaining hours

### Giveaway Interaction Window
- **Entry Window:** From `startDate` to `endDate`
- **Draw Window:** Occurs on `drawDate` at `drawTime` (6 PM by default)
- **Claim Window:** 30 days after draw to claim the prize

## Testing

### Test a Promotion Manually

SSH into VPS:
```bash
ssh -i /path/to/key ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com
cd /home/ubuntu
node test-promotion.mjs
```

### Check Promotion Logs

```bash
ssh -i /path/to/key ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com
tail -50 /home/ubuntu/promotion-scheduler.log
```

### Test API Locally

```bash
# Get giveaways
curl "http://localhost:3000/api/giveaways"

# Enter a giveaway
curl -X POST "http://localhost:3000/api/giveaways" \
  -H "Content-Type: application/json" \
  -d '{
    "giveawayId": 1,
    "userPhone": "+260970000000"
  }'

# Get agent dashboard
curl "http://localhost:3000/api/agent/dashboard?agentPhone=%2B260970000000"
```

## Configuration Files

### VPS .env File
Location: `/home/ubuntu/.env`
```
DB_HOST=ep-flat-dawn-ae5ao2h2-pooler.c-2.us-east-2.aws.neon.tech
DB_USER=neondb_owner
DB_PASSWORD=npg_pgNbvZYjUJ35
DB_NAME=neondb
DB_PORT=5432
DATABASE_URL=postgresql://neondb_owner:npg_pgNbvZYjUJ35@ep-flat-dawn-ae5ao2h2-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
APP_URL=http://localhost:3000
SUPPORT_PHONE=+260970000000
```

### Crontab Schedule
Edit with: `ssh ... crontab -e`

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Check that `.env` file exists on VPS with correct credentials
```bash
ssh -i key ubuntu@host "cat /home/ubuntu/.env | grep DATABASE"
```

### Issue: "No promotions showing"
**Solution:** Check crontab is running
```bash
ssh -i key ubuntu@host "crontab -l"
ssh -i key ubuntu@host "tail /home/ubuntu/promotion-scheduler.log"
```

### Issue: API returns 500 error
**Solution:** Check local Next.js build
```bash
npm run build
npm run dev
```

## Prize Catalog (VPS)

Current prizes available in the scheduler:

1. **Free Bus Ticket** - K500
   - Valid for any route
   - Valid for 3 months

2. **Smartphone Giveaway** - K2000
   - Latest Android smartphone with accessories

3. **PowerBank** - K300
   - 20000mAh PowerBank with cables

4. **Cash Voucher** - K1000
   - Valid for 6 months on any route

## Next Steps

1. **Frontend Components**
   - Create `GiveawayBanner.tsx` for promotions display
   - Create `AgentDashboard.tsx` for agent interface
   - Add entry forms and modals

2. **Notifications**
   - Integrate WhatsApp/SMS notifications for winners
   - Send reminders to agents about pending interactions

3. **Analytics**
   - Track giveaway participation rates
   - Monitor agent interaction completion rates

4. **Admin Panel**
   - Manual promotion creation interface
   - Winner management dashboard
   - Prize fulfillment tracking

## Support

For issues or questions:
1. Check the VPS logs: `tail /home/ubuntu/promotion-scheduler.log`
2. Verify database connection: `psql <connection-string>`
3. Test API endpoints locally with curl
4. Check Next.js console for frontend errors
