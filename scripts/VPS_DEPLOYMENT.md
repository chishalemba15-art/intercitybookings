# VPS Deployment Guide - AI Booking Generator

This guide explains how to deploy the AI-powered booking generator to your AWS EC2 VPS.

## Prerequisites

- AWS EC2 instance running Ubuntu
- SSH access with `intercitybookings.pem` key
- Neon database URL
- Hugging Face API key

## Step 1: Connect to VPS

```bash
chmod 400 intercitybookings.pem
ssh -i "intercitybookings.pem" ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com
```

## Step 2: Upload Scripts to VPS

From your local machine, upload the script:

```bash
scp -i "intercitybookings.pem" scripts/generate-bookings-ai.py ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com:~/
scp -i "intercitybookings.pem" scripts/requirements.txt ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com:~/
```

## Step 3: Install Dependencies on VPS

SSH into the VPS and run:

```bash
# Update system
sudo apt-get update

# Install Python and pip
sudo apt-get install -y python3 python3-pip

# Install Python dependencies
pip3 install -r requirements.txt
```

## Step 4: Configure Environment Variables

Create a `.env` file or export variables:

```bash
# Create environment file
nano ~/.booking-generator-env

# Add the following:
export DATABASE_URL="postgresql://username:password@host.neon.tech/dbname?sslmode=require"
export HUGGINGFACE_API_KEY="your-huggingface-api-key-here"

# Save and load
source ~/.booking-generator-env
```

Or add to `.bashrc`:

```bash
echo 'export DATABASE_URL="your-neon-database-url"' >> ~/.bashrc
echo 'export HUGGINGFACE_API_KEY="your-huggingface-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

## Step 5: Test the Script

```bash
# Make script executable
chmod +x generate-bookings-ai.py

# Test with 1 booking
python3 generate-bookings-ai.py 1

# Test with 5 bookings
python3 generate-bookings-ai.py 5
```

## Step 6: Setup Cron Job

Edit crontab:

```bash
crontab -e
```

Add one of these configurations:

### Option A: Every 5 minutes (high frequency - more FOMO effect)
```bash
*/5 * * * * source ~/.booking-generator-env && cd ~ && python3 generate-bookings-ai.py >> bookings.log 2>&1
```

### Option B: Every 10 minutes (medium frequency)
```bash
*/10 * * * * source ~/.booking-generator-env && cd ~ && python3 generate-bookings-ai.py >> bookings.log 2>&1
```

### Option C: Every 15 minutes (lower frequency)
```bash
*/15 * * * * source ~/.booking-generator-env && cd ~ && python3 generate-bookings-ai.py >> bookings.log 2>&1
```

### Option D: Peak hours only (9 AM - 9 PM, every 5 minutes)
```bash
*/5 9-21 * * * source ~/.booking-generator-env && cd ~ && python3 generate-bookings-ai.py >> bookings.log 2>&1
```

## Step 7: Monitor Logs

```bash
# View logs
tail -f ~/bookings.log

# View last 50 lines
tail -50 ~/bookings.log

# Clear logs
> ~/bookings.log
```

## Features of AI Generator

### 1. **AI-Powered Name Generation**
- Uses Mistral-7B-Instruct model via Hugging Face API
- Generates realistic Zambian names
- Falls back to curated name list if API fails

### 2. **Smart Booking Logic**
- Queries real buses and routes from database
- Checks seat availability before booking
- Updates available seats automatically
- Generates unique booking references

### 3. **Realistic Data**
- Random travel dates (1-14 days ahead)
- Zambian phone numbers (+260 format)
- Multiple payment methods
- Random booking frequency (1-3 per run)

### 4. **Database Integration**
- Direct connection to Neon PostgreSQL
- Transactional booking creation
- Automatic seat management
- Confirmed booking status

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql "$DATABASE_URL" -c "SELECT version();"
```

### Check if cron is running

```bash
sudo service cron status
```

### View cron logs

```bash
grep CRON /var/log/syslog
```

### Manually test with debug output

```bash
python3 -u generate-bookings-ai.py 1
```

## Update Script

To update the script on VPS:

```bash
# From local machine
scp -i "intercitybookings.pem" scripts/generate-bookings-ai.py ubuntu@ec2-13-60-13-137.eu-north-1.compute.amazonaws.com:~/

# On VPS, restart cron (not necessary but ensures clean state)
sudo service cron restart
```

## Security Notes

1. **Never commit** `.pem` files or database URLs to git
2. Store `DATABASE_URL` securely in environment variables
3. Restrict `intercitybookings.pem` permissions: `chmod 400`
4. Consider using AWS Secrets Manager for production

## Performance Recommendations

- **High traffic sites**: Every 5-10 minutes
- **Medium traffic**: Every 15-20 minutes
- **Peak hours only**: 9 AM - 9 PM schedule
- **Adjustable frequency**: Script generates 1-3 bookings per run randomly

## Current Configuration

```
VPS Instance: i-00cfd017f262f2a4a (IntercityBookingsAutomations)
Region: eu-north-1
Public DNS: ec2-13-60-13-137.eu-north-1.compute.amazonaws.com
SSH User: ubuntu
Key: intercitybookings.pem
```
