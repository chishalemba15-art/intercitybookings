# Database Setup Guide

Your Neon database is ready to be configured! Follow these simple steps:

## Option 1: Run SQL in Neon Console (Recommended - 2 minutes)

### Step 1: Open Neon SQL Editor
1. Go to https://console.neon.tech
2. Select your project: **intercitybookings** (or the project you created)
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Schema
1. Open the file `schema.sql` in this project
2. Copy ALL the contents (Ctrl+A, Ctrl+C)
3. Paste into the Neon SQL Editor
4. Click **Run** button (or press Ctrl+Enter)

**That's it!** Your database is now ready with:
- ✅ 6 tables created
- ✅ 5 bus operators added
- ✅ 6 routes configured
- ✅ 6 bus schedules ready
- ✅ All relationships and indexes set up

## Option 2: Using psql Command Line

If you prefer command line:

```bash
psql 'postgresql://neondb_owner:npg_pgNbvZYjUJ35@ep-flat-dawn-ae5ao2h2-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require' < schema.sql
```

## Verify Setup

Run this query in Neon SQL Editor to verify:

```sql
-- Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check data
SELECT COUNT(*) as operators FROM operators;
SELECT COUNT(*) as routes FROM routes;
SELECT COUNT(*) as buses FROM buses;
```

You should see:
- 6 tables listed
- 5 operators
- 6 routes
- 6 buses

## Environment Variables for Vercel

Add these to your Vercel project:

```
DATABASE_URL=postgresql://neondb_owner:npg_pgNbvZYjUJ35@ep-flat-dawn-ae5ao2h2-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app

NEXT_PUBLIC_SUPPORT_PHONE=+260970000000
```

## Test Your Database

Once setup is complete, you can test by:

1. **Run dev server locally:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

2. **Deploy to Vercel:**
   - Push to GitHub (already done ✓)
   - Vercel auto-deploys
   - Add environment variables in Vercel dashboard

## Database Schema Overview

### Tables Created:
1. **operators** - Bus companies (Mazhandu, Power Tools, etc.)
2. **routes** - City routes with distance/duration
3. **buses** - Bus schedules, pricing, features
4. **bookings** - Customer reservations
5. **payments** - Payment transactions
6. **feedback** - Customer reviews

### Sample Data Included:
- **Mazhandu Family** - Luxury service (Red)
- **Power Tools** - Standard service (Blue)
- **Juldan Motors** - Premium long-distance (Green)
- **Shalom Bus** - Reliable standard (Purple)
- **Likili** - Remote destinations (Orange)

### Routes Available:
- Lusaka → Livingstone (480km, K350)
- Lusaka → Kitwe (320km, K280)
- Lusaka → Johannesburg (1200km, K1200)
- Lusaka → Chipata (570km, K300)
- Lusaka → Mongu (580km, K400)
- Lusaka → Ndola (320km, K310)

## Next Steps

1. ✅ Run `schema.sql` in Neon Console
2. ✅ Add environment variables to Vercel
3. ✅ Deploy or test locally
4. 🎉 Your app is live!

## Troubleshooting

**Error: relation already exists**
- Tables already created! You're good to go.

**Error: permission denied**
- Make sure you're using the connection string with write access

**Can't connect to database**
- Verify your Neon project is active
- Check the connection string is correct

## Support

Need help? The database structure is fully documented in `src/db/schema.ts`
