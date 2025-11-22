# Google Authentication Setup Guide

## Overview

The InterCity Bookings platform now includes Google OAuth authentication through Stack Auth. Users get 2 free searches before being required to sign in with their Google account.

---

## ✅ What's Been Implemented

### 1. **Search Limit System**
- Users can perform **2 free searches** without registration
- After 2 searches, they're prompted to sign in
- Registered/authenticated users get **unlimited searches**

### 2. **Authentication Pages**
- **Login Page** (`/login`) - Beautiful sign-in interface
- **Auth Callback** (`/auth/callback`) - Handles OAuth redirect
- **Registration Modal** - Local registration option

### 3. **Google OAuth Integration**
- Stack Auth project configured with Google provider
- OAuth flow implemented
- Token exchange and user data retrieval set up

### 4. **User Session Management**
- StackAuthContext for global auth state
- Persistent user sessions with localStorage
- Custom event system for auth state updates

---

## 🔧 Configuration Required

### Step 1: Set Up Environment Variables

Add to your `.env.local` file:

```env
# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID=fca0f5b4-4e42-4cf2-a0c4-d61a04dd8a98
NEXT_PUBLIC_STACK_URL=https://api.stack-auth.com
STACK_PROJECT_SECRET=your_stack_project_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Get Stack Auth Keys

1. Go to [Stack Auth Dashboard](https://stack-auth.com)
2. Navigate to your project (ID: `fca0f5b4-4e42-4cf2-a0c4-d61a04dd8a98`)
3. Go to **Settings → Environment Variables**
4. Copy the `STACK_PROJECT_SECRET`
5. Add it to your `.env.local`

### Step 3: Configure Google OAuth

In Stack Auth Dashboard:

1. Go to **Settings → OAuth Providers**
2. Click **"Add OAuth Provider"**
3. Select **Google**
4. Add your app URLs to **Trusted Domains**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Set redirect URI: `{YOUR_APP_URL}/auth/callback`

### Step 4: Update Redirect Domain

In Stack Auth Dashboard under **Settings → Domains**:

Add your domain:
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

---

## 📱 User Flow

### Scenario 1: Guest User
```
1. User visits homepage
   ↓
2. Makes first search → Success ✓
   ↓
3. Makes second search → Success ✓
   ↓
4. Attempts third search
   ↓
5. Redirected to /login page
   ↓
6. Signs in with Google
   ↓
7. Authenticated user with unlimited searches
```

### Scenario 2: Returning User
```
1. User visits homepage
   ↓
2. Already authenticated (token in localStorage)
   ↓
3. Unlimited searches available
```

---

## 🗂️ File Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Login page with Google button
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx      # OAuth callback handler
│   └── api/
│       └── auth/
│           └── callback/
│               └── route.ts  # Token exchange API
├── context/
│   └── StackAuthContext.tsx  # Global auth state
└── hooks/
    └── useUserSession.ts     # Session management (MAX_FREE_SEARCHES=2)
```

---

## 🔐 Security Features

✅ Secure token exchange with backend
✅ Redirect URI validation
✅ Environment variables protection
✅ HTTPS in production
✅ Secure localStorage usage
✅ CORS protection

---

## 🎨 Login Page Features

- **Beautiful gradient design** with animations
- **Google sign-in button** with proper branding
- **Guest continue option** for casual users
- **Feature highlights** showing benefits
- **Responsive design** (mobile, tablet, desktop)
- **Loading states** during authentication

---

## 🧪 Testing Authentication

### Test 2-Search Limit

1. Open application in incognito/private mode
2. Perform first search → Should work ✓
3. Perform second search → Should work ✓
4. Attempt third search → Redirected to `/login`

### Test Google Sign In

1. Navigate to `/login`
2. Click "Continue with Google"
3. You'll be redirected to Google Sign In
4. After authentication, redirected back to `/`
5. Check localStorage for `stack_auth_user` and `stack_auth_token`

### Test Guest Continue

1. Navigate to `/login`
2. Click "Continue as Guest"
3. Returns to homepage (limited to 2 searches)

---

## 📊 User Session Data

After successful Google auth, localStorage contains:

```json
{
  "stack_auth_user": {
    "id": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "profileImageUrl": "https://..."
  },
  "stack_auth_token": "access_token_xxx",
  "intercity_user_session": {
    "name": "John Doe",
    "phone": "+260970000000",
    "searchCount": 0,
    "registeredAt": "2025-11-22T..."
  }
}
```

---

## 🔄 Search Count Limits

| User Type | Search Limit |
|-----------|-------------|
| Guest (unauthenticated) | 2 free searches |
| Registered via email | Unlimited |
| Signed in with Google | Unlimited |

---

## 🛠️ API Endpoints

### `POST /api/auth/callback`
Exchanges authorization code for access token

**Request:**
```json
{
  "code": "authorization_code_from_google"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@gmail.com",
    "displayName": "John Doe",
    "profileImageUrl": "https://..."
  },
  "token": "access_token_xxx"
}
```

---

## 🚀 Production Deployment

### Before Going Live

1. **Configure Production Domain**
   - Update Stack Auth trusted domains
   - Add production URL to CORS allowed origins

2. **Environment Variables**
   - Use production `STACK_PROJECT_SECRET`
   - Update `NEXT_PUBLIC_APP_URL` to production domain

3. **Google OAuth Verification**
   - Verify redirect URIs match production domain
   - Test full OAuth flow in production

4. **SSL/HTTPS**
   - Ensure HTTPS enabled on production
   - Update OAuth redirect to use HTTPS

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution:** Ensure `NEXT_PUBLIC_APP_URL` matches domain in Stack Auth

### Issue: "Missing authorization code"
**Solution:** Check that OAuth callback is being called with `?code=...`

### Issue: Token not saving
**Solution:** Check browser localStorage is enabled and not blocked

### Issue: "Invalid project secret"
**Solution:** Verify `STACK_PROJECT_SECRET` env variable is set correctly

---

## 📚 Resources

- [Stack Auth Documentation](https://docs.stack-auth.com)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Best Practices](https://nextjs.org/docs/authentication)

---

## 📝 Next Steps

1. ✅ Add environment variables to `.env.local`
2. ✅ Configure Google OAuth in Stack Auth Dashboard
3. ✅ Add trusted domains
4. ✅ Test authentication locally
5. 🔄 Deploy to production
6. 🔄 Monitor auth flow metrics

---

**Status: Ready for Integration** ✅

All authentication components are in place and ready to use. Follow the configuration steps above to complete the setup.
