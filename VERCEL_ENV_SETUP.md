# Vercel Environment Variables Setup

## Quick Copy-Paste Guide

Go to: **Vercel Dashboard > Your Project > Settings > Environment Variables**

---

## Variable 1: DATABASE_URL

**Name:**
```
DATABASE_URL
```

**Value:**
```
postgresql://neondb_owner:npg_pgNbvZYjUJ35@ep-flat-dawn-ae5ao2h2-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Environment:** ✅ Production, ✅ Preview, ✅ Development (select all 3)

---

## Variable 2: NEXT_PUBLIC_APP_URL

**Name:**
```
NEXT_PUBLIC_APP_URL
```

**Value (Production):**
```
https://intercitybookings.vercel.app
```

**Environment:** ✅ Production only

**Value (Preview):**
```
https://intercitybookings-git-claude-improve-bookings-app-013jqurbibgccehjivgvgg5-chishalemba15-art.vercel.app
```

**Environment:** ✅ Preview only

**Value (Development):**
```
http://localhost:3000
```

**Environment:** ✅ Development only

---

## Variable 3: NEXT_PUBLIC_SUPPORT_PHONE

**Name:**
```
NEXT_PUBLIC_SUPPORT_PHONE
```

**Value:**
```
+260970000000
```

**Environment:** ✅ Production, ✅ Preview, ✅ Development (select all 3)

---

## After Adding Variables

1. Click **"Save"** button
2. Go to **"Deployments"** tab
3. Click latest deployment
4. Click **"Redeploy"** button
5. **Uncheck** "Use existing Build Cache"
6. Click **"Redeploy"**

---

## Verification

After deployment succeeds, your app will be live at:
```
https://intercitybookings.vercel.app
```

Test these features:
- ✅ Splash screen appears
- ✅ Bus listings load
- ✅ Search works
- ✅ Booking modal opens
- ✅ Mobile responsive design
