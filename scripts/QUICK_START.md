# Quick Start Guide - VPS Booking Generator

## What Was Created

I've created an **AI-powered booking generator** that uses transformers to create realistic booking notifications for your FOMO system.

### Files Created:
1. **`generate-bookings-ai.py`** - Main Python script using Hugging Face AI
2. **`requirements.txt`** - Python dependencies
3. **`run-booking-generator.sh`** - Shell wrapper for cron
4. **`VPS_DEPLOYMENT.md`** - Full deployment guide

## Key Features

✅ **AI-Generated Names**: Uses Mistral-7B-Instruct via Hugging Face to generate realistic Zambian names
✅ **Real Database**: Connects directly to your Neon PostgreSQL (no mock data)
✅ **Smart Logic**: Checks seat availability, generates unique refs, updates seats
✅ **FOMO Effect**: Generates 1-3 random bookings per execution
✅ **Zambian Context**: Phone numbers (+260), cities, and culturally appropriate names

## How It Works

```
Cron Job (every 5-15 min) → Python Script → Hugging Face API → Generate Name
                                         ↓
                              Query Neon DB for available bus
                                         ↓
                              Create booking with AI name
                                         ↓
                              Frontend polls /api/recent-bookings
                                         ↓
                              Toast notification appears
```

## Quick Deploy to VPS (3 Steps)

### 1. Upload to VPS
```bash
# From your local machine
scp -i "intercitybookings.pem" scripts/* ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com:~/
```

### 2. Setup on VPS
```bash
# SSH into VPS
ssh -i "intercitybookings.pem" ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com

# Install dependencies
pip3 install -r requirements.txt

# Set environment variables
echo 'export DATABASE_URL="your-neon-url"' >> ~/.bashrc
echo 'export HUGGINGFACE_API_KEY="your-hf-key"' >> ~/.bashrc
source ~/.bashrc

# Test it
python3 generate-bookings-ai.py 1
```

### 3. Setup Cron
```bash
crontab -e

# Add this line (runs every 5 minutes)
*/5 * * * * source ~/.bashrc && cd ~ && python3 generate-bookings-ai.py >> bookings.log 2>&1
```

## Environment Variables Needed

```bash
DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require"
HUGGINGFACE_API_KEY="your-key-here"  # The one you shared earlier
```

## Testing

```bash
# Generate 1 booking
python3 generate-bookings-ai.py 1

# Generate 5 bookings
python3 generate-bookings-ai.py 5

# Default (1-3 random)
python3 generate-bookings-ai.py
```

## Expected Output

```
🚀 Generating 2 booking(s) with AI...
✅ Connected to database
✅ Booking 1/2: BK20251124205612ABCD - Chanda Mulenga - Lusaka → Kitwe (Seat 12)
✅ Booking 2/2: BK20251124205615EFGH - Bwalya Tembo - Ndola → Livingstone (Seat 08)

📊 Summary: 2/2 bookings created successfully
```

## Frontend Integration (Already Working!)

Your existing code already handles this:
- ✅ `/api/recent-bookings` pulls from database
- ✅ `useBookingNotifications` hook polls every 15 seconds
- ✅ Toast notifications display new bookings
- ✅ Names are anonymized (First + Last Initial)

## Monitoring

```bash
# Watch logs in real-time
tail -f ~/bookings.log

# Check if cron is running
ps aux | grep python3

# View cron status
sudo service cron status
```

## Troubleshooting

**No bookings appearing?**
- Check if script is in crontab: `crontab -l`
- Check logs: `cat ~/bookings.log`
- Test manually: `python3 generate-bookings-ai.py 1`

**Database connection errors?**
- Verify DATABASE_URL is set: `echo $DATABASE_URL`
- Test connection: `psql "$DATABASE_URL" -c "SELECT 1"`

**AI not working?**
- Verify HUGGINGFACE_API_KEY: `echo $HUGGINGFACE_API_KEY`
- Script will fallback to curated Zambian names if AI fails

## Next Steps

1. **Deploy to VPS** using the 3-step guide above
2. **Test** with `python3 generate-bookings-ai.py 1`
3. **Setup cron** for automatic generation
4. **Monitor** your frontend for booking notifications
5. **Adjust frequency** based on traffic (every 5-15 min recommended)

For detailed instructions, see `VPS_DEPLOYMENT.md`.
