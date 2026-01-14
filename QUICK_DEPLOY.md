# ⚡ Quick Deploy to Vercel (5 Minutes)

## Prerequisites
- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (sign up at vercel.com)
- Firebase project with credentials

## Step 1: Prepare (2 minutes)

```bash
# 1. Delete admin setup file
rm setup-admin.html

# 2. Verify files
ls -la vercel.json  # Should exist ✅

# 3. Build locally to test
npm run build  # Should succeed ✅

# 4. Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy (3 minutes)

### Option A: Vercel Dashboard (Easiest)

1. **Go to** https://vercel.com/new

2. **Import Repository**
   - Select Git provider
   - Choose Budgetly repo
   - Click "Import"

3. **Configure (auto-detected)**
   - Framework: Vite ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅

4. **Add Environment Variables**

   Click "Environment Variables", add these:

   ```
   VITE_FIREBASE_API_KEY = your-api-key
   VITE_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = your-project-id
   VITE_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID = your-sender-id
   VITE_FIREBASE_APP_ID = your-app-id
   VITE_FIREBASE_MEASUREMENT_ID = G-XXXXXXXXXX
   ```

   **Get these from:**
   Firebase Console → Settings ⚙️ → Project Settings → Your apps

5. **Click "Deploy"**

   Wait 1-3 minutes... ☕

   Done! You'll get: `https://budgetly-abc123.vercel.app`

### Option B: Vercel CLI (For developers)

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 3: Configure Firebase

1. **Go to** Firebase Console

2. **Add Authorized Domain**
   - Authentication → Settings
   - Authorized domains
   - Click "Add domain"
   - Add: `your-app.vercel.app`

3. **Test Your Site!**
   - Visit your Vercel URL
   - Try signing up
   - Test calculator
   - Everything should work! ✅

## Common Issues & Quick Fixes

### Build Fails
```bash
# Test build locally first
npm install
npm run build
```

### Blank Page
- Check environment variables in Vercel
- Open browser console (F12) for errors

### "Auth Error"
- Add Vercel domain to Firebase Authorized Domains

### 404 on Routes
- Already fixed in vercel.json ✅

## That's It! 🎉

Your app is live at: `https://your-app.vercel.app`

### Next Steps (Optional)

1. **Custom Domain**
   - Vercel Dashboard → Settings → Domains
   - Add your domain (e.g., budgetly.com)

2. **Analytics**
   ```bash
   npm install @vercel/analytics
   ```

3. **Monitor**
   - Check Vercel Dashboard for traffic
   - Monitor Firebase usage

## Automatic Deployments

Every git push automatically deploys! 🚀

```bash
# Make changes
git add .
git commit -m "New feature"
git push

# Vercel auto-deploys in 1-2 minutes
```

## Useful Commands

```bash
# View deployments
vercel ls

# View logs
vercel logs

# Rollback
vercel rollback

# Remove deployment
vercel rm [deployment-name]
```

## URLs

- **Your Site:** https://your-app.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com

## Need More Details?

See `DEPLOYMENT_GUIDE.md` for complete documentation.

## Deployment Checklist

Quick pre-flight check:

- [ ] `npm run build` succeeds
- [ ] `setup-admin.html` deleted
- [ ] `.env` in `.gitignore`
- [ ] Code pushed to Git
- [ ] Firebase credentials ready
- [ ] Vercel account created

All checked? **Deploy now!** 🚀
