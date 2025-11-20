# Deployment Guide

## Quick Start with Vercel + Neon

### Step 1: Prepare Neon Database

1. **Create Neon Project**
   ```
   - Visit https://console.neon.tech
   - Click "Create Project"
   - Name: intercitybookings
   - Region: Choose closest to your users
   - Copy connection string
   ```

2. **Set Up Database**
   ```bash
   # Clone repo and install
   git clone <repo-url>
   cd intercitybookings
   npm install

   # Configure .env
   echo "DATABASE_URL=your_neon_connection_string" > .env

   # Push schema and seed
   npm run db:push
   npm run db:migrate
   ```

### Step 2: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Configure Environment Variables**
   ```
   DATABASE_URL = postgresql://...@....neon.tech/neondb?sslmode=require
   NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
   NEXT_PUBLIC_SUPPORT_PHONE = +260970000000
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

## Alternative: Self-Hosted

### Docker Deployment

```bash
# Build image
docker build -t intercitybookings .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_connection_string" \
  intercitybookings
```

### Traditional VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo-url>
cd intercitybookings
npm install
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "intercitybookings" -- start
pm2 save
pm2 startup
```

## Post-Deployment Checklist

- [ ] Database is seeded with initial data
- [ ] Environment variables are set
- [ ] Custom domain is configured (optional)
- [ ] SSL certificate is active
- [ ] Analytics are tracking (if configured)
- [ ] Error monitoring is active
- [ ] Backup strategy is in place

## Monitoring

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Database Monitoring

Monitor your Neon database at:
- https://console.neon.tech/app/projects/your-project-id

Track:
- Connection count
- Query performance
- Storage usage
- Compute usage

## Scaling Considerations

### Neon Auto-scaling
- Automatically scales compute based on load
- Scales to zero when inactive (Free tier)
- Upgrade to Pro for higher limits

### Next.js Optimization
- Enable ISR (Incremental Static Regeneration)
- Implement caching strategies
- Use CDN for static assets
- Optimize images with Next.js Image component

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql "your_connection_string"

# Check environment variables
vercel env ls
```

### Build Failures
```bash
# Local build test
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### Performance Issues
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

## Backup Strategy

### Neon Backups
- Enable Neon's point-in-time recovery
- Automatic backups every 24 hours
- Retention: 7 days (Free), 30 days (Pro)

### Manual Backup
```bash
# Export data
pg_dump "your_connection_string" > backup.sql

# Restore
psql "your_connection_string" < backup.sql
```

## Security Checklist

- [x] Environment variables not committed
- [x] Database connection uses SSL
- [ ] Rate limiting configured
- [ ] CORS policy set
- [ ] Input validation on all forms
- [ ] SQL injection protection (Drizzle ORM)
- [ ] XSS protection enabled
- [ ] HTTPS enforced

## Cost Optimization

### Neon Free Tier Limits
- Compute: 100 hours/month
- Storage: 3 GB
- Projects: 10

### Vercel Free Tier Limits
- Bandwidth: 100 GB/month
- Builds: 100 hours/month
- Serverless executions: 100 GB-hours

### Tips
1. Enable Neon's auto-scaling to zero
2. Implement caching to reduce database queries
3. Optimize images and assets
4. Use ISR for frequently accessed pages

## Support

Need help? Contact:
- Vercel Support: https://vercel.com/support
- Neon Community: https://community.neon.tech
- Project Issues: GitHub Issues
