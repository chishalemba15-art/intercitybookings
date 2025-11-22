# Google OAuth Quick Start Guide 🚀

**Get the OAuth system up and running in 5 minutes**

---

## Prerequisites

✅ Node.js 18+ installed
✅ `.env.local` file with Stack Auth credentials
✅ Port 3000+ available (dev server will use next available)

---

## Step 1: Start the Development Server

```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.2.33
  - Local:        http://localhost:3002
  - Environments: .env.local

 ✓ Ready in 2.1s
```

Dev server will be available at `http://localhost:3002`

---

## Step 2: Test the Search Limit Flow

### Visit the Homepage
```
Navigate to: http://localhost:3002/
```

### Perform 2 Free Searches
1. Enter destination: "Lusaka"
2. Select a date
3. Click "Search" button
4. See buses displayed

Repeat 2 times (do 2 searches total)

### Attempt 3rd Search
1. Try to search again
2. **Expected:** Toast message: "Create an account to continue searching"
3. **Expected:** Page redirects to login page

---

## Step 3: Test Google OAuth Login

### You should now be on the login page:
```
URL: http://localhost:3002/login
```

### Click the "Continue with Google" Button

You should be redirected to Stack Auth's Google OAuth flow.

### In the OAuth Flow:
1. Select your Google account (or log in if needed)
2. Grant permissions to the application
3. You'll be redirected back to the app

---

## Step 4: Verify Authentication

After OAuth completes, you should:

1. **Return to Homepage**
   - URL: `http://localhost:3002/`
   - User info should be loaded

2. **Perform Unlimited Searches**
   - Search 3, 4, 5+ times
   - **Expected:** No login redirect, unlimited searches work

3. **Check localStorage**
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Look for:
     - `stack_auth_user` - User data
     - `stack_auth_token` - Access token
     - `intercity_user_session` - Session data

---

## Step 5: Test Logout

### Click Settings in Navbar
1. Look for settings/profile menu
2. Click "Sign Out" button
3. **Expected:** localStorage cleared, user logged out
4. **Expected:** Search limit resets to 0/2

---

## Quick Testing Checklist

- [ ] Dev server starts without errors
- [ ] Homepage loads and search works
- [ ] 2 free searches work
- [ ] 3rd search redirects to login
- [ ] Login page loads with Google button
- [ ] Click Google button works
- [ ] OAuth redirects to Stack Auth
- [ ] OAuth completes successfully
- [ ] User returns to homepage
- [ ] Unlimited searches work after login
- [ ] localStorage contains user data
- [ ] Sign out clears data
- [ ] After logout, 2 search limit resets

---

## Debugging

### If Login Page Shows "Loading" Forever

1. **Check Browser Console** (F12 → Console)
   - Look for error messages
   - Check Network tab for failed requests

2. **Check Environment Variables**
   ```bash
   grep STACK_PROJECT_ID .env.local
   ```
   Should output: `NEXT_PUBLIC_STACK_PROJECT_ID=fca0f5b4-4e42-4cf2-a0c4-d61a04dd8a98`

3. **Restart Dev Server**
   ```bash
   # Kill current server (Ctrl+C)
   npm run dev
   ```

### If OAuth Redirects to Google Instead of Stack Auth

1. This is actually correct behavior
2. Google OAuth is the provider
3. You'll log in with your Google account
4. Then be redirected back to the app

### If Search Limit Not Working

1. Clear localStorage:
   - DevTools → Application → Clear all
2. Refresh page
3. Try searching again
4. Try 3rd search (should redirect)

### If User Data Not Showing After Login

1. Check localStorage in DevTools
2. Look for `stack_auth_user` key
3. If missing, OAuth token exchange may have failed
4. Check Network tab in DevTools for API errors

---

## Manual OAuth URL Testing

To manually test the OAuth URL formation:

```bash
# Open dev server URL in browser
http://localhost:3002/

# Click login
http://localhost:3002/login

# Click Google button - you'll see the full OAuth URL in Network tab
```

**Expected OAuth URL Format:**
```
https://app.stack-auth.com/api/oauth/authorize?
  project_id=fca0f5b4-4e42-4cf2-a0c4-d61a04dd8a98&
  provider=google&
  redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fauth%2Fcallback&
  client_id=fca0f5b4-4e42-4cf2-a0c4-d61a04dd8a98
```

---

## Testing with Different Browsers

The OAuth system works with:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

Each browser will have its own localStorage, so you can test fresh logins in each.

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3002 in use | Run `lsof -i :3002` to find process, then kill it |
| OAuth button doesn't work | Restart dev server after updating .env.local |
| Stuck on "Completing Your Sign In" | Check Network tab, look for failed /api/auth/callback request |
| User not staying logged in | Check localStorage for stack_auth_user |
| Search limit bypassed | Clear browser cache and localStorage |

---

## What's Being Tested

1. **Search Limit System**
   - ✅ 2 free searches for unauthenticated users
   - ✅ Redirect to login on 3rd search attempt

2. **OAuth Flow**
   - ✅ Login page loads
   - ✅ OAuth URL correctly formed
   - ✅ Redirect to Stack Auth
   - ✅ User authentication
   - ✅ Redirect back to app

3. **Token Exchange**
   - ✅ Authorization code exchanged for token
   - ✅ User data retrieved
   - ✅ Data saved to localStorage

4. **Session Management**
   - ✅ User data persists across page refreshes
   - ✅ Logout clears data
   - ✅ Search limit resets after logout

---

## Next Steps

After successful testing:

1. **For Production:** Update Stack Auth project with production domain
2. **For Staging:** Deploy with staging credentials
3. **For Team:** Share credentials securely

---

## Need Help?

- Check browser console (F12) for error messages
- Look at Network tab to see API calls
- Review localStorage in Application tab
- See OAUTH_VERIFICATION_COMPLETE.md for detailed documentation

---

**Happy Testing! 🚀**

Start with: `npm run dev`
