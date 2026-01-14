# 🚀 Deploying Budgetly to Vercel

## Prerequisites

Before deploying, make sure you have:
- ✅ A Vercel account (sign up at https://vercel.com)
- ✅ Firebase project set up
- ✅ All environment variables ready
- ✅ Code pushed to GitHub/GitLab/Bitbucket

## Step-by-Step Deployment

### 1️⃣ Prepare Your Project

#### A. Create `.gitignore` (if not already)

Make sure these are in your `.gitignore`:

```
# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# production
build
dist

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/*
!.vscode/extensions.json
.idea
*.swp
*.swo
*~

# Firebase
.firebase
firebase-debug.log
firestore-debug.log
ui-debug.log

# Temporary files
setup-admin.html
*.tmp
```

#### B. Create `vercel.json` Configuration

Create a file named `vercel.json` in your project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_FIREBASE_API_KEY": "@vite_firebase_api_key",
    "VITE_FIREBASE_AUTH_DOMAIN": "@vite_firebase_auth_domain",
    "VITE_FIREBASE_PROJECT_ID": "@vite_firebase_project_id",
    "VITE_FIREBASE_STORAGE_BUCKET": "@vite_firebase_storage_bucket",
    "VITE_FIREBASE_MESSAGING_SENDER_ID": "@vite_firebase_messaging_sender_id",
    "VITE_FIREBASE_APP_ID": "@vite_firebase_app_id",
    "VITE_FIREBASE_MEASUREMENT_ID": "@vite_firebase_measurement_id"
  }
}
```

### 2️⃣ Push Code to Git Repository

If you haven't already:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/budgetly.git

# Push to main branch
git push -u origin main
```

### 3️⃣ Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended for first time)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Vercel to access your repositories
   - Select the Budgetly repository

3. **Configure Project**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables**

   Click "Environment Variables" and add these:

   ```
   VITE_FIREBASE_API_KEY = your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = your-project-id
   VITE_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID = your-sender-id
   VITE_FIREBASE_APP_ID = your-app-id
   VITE_FIREBASE_MEASUREMENT_ID = G-XXXXXXXXXX
   ```

   **Where to find these values:**
   - Go to Firebase Console
   - Select your project
   - Click Settings (⚙️) → Project Settings
   - Scroll to "Your apps" section
   - Copy values from the Firebase config

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (1-3 minutes)
   - You'll get a URL like: `https://budgetly-xyz123.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? budgetly
# - In which directory is your code located? ./
# - Want to override settings? No

# Deploy to production
vercel --prod
```

### 4️⃣ Configure Firebase for Vercel

#### A. Update Firebase Auth Authorized Domains

1. Go to Firebase Console
2. Authentication → Settings → Authorized domains
3. Click "Add domain"
4. Add your Vercel domain:
   - `budgetly-xyz123.vercel.app` (your actual domain)
   - If you have a custom domain, add that too

#### B. Update Firebase Hosting (Optional)

If you want to use Firebase Hosting with Vercel CDN:

```bash
firebase init hosting

# Choose:
# - What do you want to use as your public directory? dist
# - Configure as a single-page app? Yes
# - Set up automatic builds with GitHub? No
```

### 5️⃣ Set Up Custom Domain (Optional)

1. **Buy a domain** (e.g., from Namecheap, GoDaddy)

2. **Add to Vercel:**
   - Go to your project in Vercel Dashboard
   - Settings → Domains
   - Add your domain (e.g., `budgetly.com`)

3. **Configure DNS:**
   - Add these records to your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.21.21
   ```

4. **Add to Firebase:**
   - Firebase Console → Authentication → Settings
   - Add your custom domain to Authorized domains

### 6️⃣ Post-Deployment Checklist

#### Security:
- [ ] Environment variables set in Vercel
- [ ] Firebase security rules deployed
- [ ] Authorized domains configured in Firebase
- [ ] `.env` file NOT committed to git
- [ ] `setup-admin.html` deleted from repository

#### Functionality:
- [ ] Test sign up
- [ ] Test sign in
- [ ] Test calculator
- [ ] Test scenarios
- [ ] Test dashboard
- [ ] Test admin panel (if admin claim set)
- [ ] Test on mobile devices

#### Performance:
- [ ] Check Lighthouse score (should be 90+)
- [ ] Test loading speed
- [ ] Verify images load correctly

### 7️⃣ Continuous Deployment

Vercel automatically deploys when you push to your repository:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Vercel automatically builds and deploys! 🎉
```

**Preview Deployments:**
- Every branch gets a preview URL
- Pull requests get unique preview URLs
- Perfect for testing before merging to main

### 8️⃣ Environment Variables for Different Environments

Vercel supports multiple environments:

1. **Production:** Used for main branch
2. **Preview:** Used for PRs and other branches
3. **Development:** Used locally

To set environment-specific values:
```bash
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_API_KEY preview
```

### 9️⃣ Troubleshooting

#### Build Fails

**Check build logs:**
- Vercel Dashboard → Deployments → Click on failed deployment
- Look for error messages

**Common issues:**
```bash
# Missing dependencies
npm install

# TypeScript errors
npm run build

# Environment variables missing
# Add them in Vercel Dashboard
```

#### Blank Page After Deploy

**Check browser console:**
- Open developer tools (F12)
- Look for errors

**Common fixes:**
1. Environment variables not set
2. Firebase config incorrect
3. Build output directory wrong (should be `dist`)

#### Routes Not Working (404 on refresh)

**Solution:** Already fixed in `vercel.json` with rewrites config.

If still not working:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Firebase Connection Issues

**Check:**
1. Authorized domains in Firebase
2. Environment variables correct
3. Firebase project ID matches

**Test connection:**
```javascript
// In browser console on deployed site:
console.log(import.meta.env.VITE_FIREBASE_API_KEY)
// Should show your API key (this is safe to expose)
```

### 🔟 Monitoring & Analytics

#### Vercel Analytics (Free)

Add to your site:
```bash
npm install @vercel/analytics

# Add to main.tsx:
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

#### Vercel Speed Insights

```bash
npm install @vercel/speed-insights

# Add to main.tsx:
import { SpeedInsights } from '@vercel/speed-insights/react';

<SpeedInsights />
```

### 1️⃣1️⃣ Performance Optimization

#### Enable Vercel Edge Network

Already enabled by default! Vercel uses:
- Global CDN (200+ locations)
- Automatic HTTPS
- DDoS protection
- Edge caching

#### Optimize Build

Update `package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### Enable Compression

Already handled by Vercel:
- Brotli compression
- Gzip fallback
- Automatic optimization

### 1️⃣2️⃣ Backup & Rollback

#### Rollback to Previous Deployment

1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click three dots (...)
4. Select "Promote to Production"

#### Instant Rollback

```bash
vercel rollback
```

### 1️⃣3️⃣ Cost Estimate

**Vercel Hobby Plan (Free):**
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ 6000 build minutes/month
- ✅ HTTPS included
- ✅ Custom domains

**Pro Plan ($20/month):**
- More bandwidth
- Password protection
- Team collaboration
- Priority support

**Firebase (Free Spark Plan):**
- ✅ 10GB storage
- ✅ 50K reads/day
- ✅ 20K writes/day
- ✅ 20K deletes/day

For Budgetly, the free plans should be sufficient unless you get significant traffic.

### 1️⃣4️⃣ Security Best Practices for Production

#### A. Enable Security Headers

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### B. Firebase App Check

```bash
# Enable in Firebase Console
# Authentication → App Check
# Register your domain
```

#### C. Rate Limiting

Use Vercel's edge middleware or Firebase Functions rate limiting.

### 1️⃣5️⃣ Quick Commands Reference

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Remove deployment
vercel remove [deployment-name]

# Link local project to Vercel
vercel link

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add [name]
```

### 1️⃣6️⃣ Final Checklist

Before going live:

- [ ] All features tested on deployed site
- [ ] Admin panel works (after setting custom claims)
- [ ] Firebase security rules deployed
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured (if applicable)
- [ ] Analytics set up
- [ ] Error monitoring configured
- [ ] Backup strategy in place
- [ ] `setup-admin.html` deleted
- [ ] Environment variables secured
- [ ] Admin custom claims set via Cloud Functions
- [ ] 2FA enabled on admin account

## 🎉 You're Live!

Your Budgetly app should now be live at:
- Vercel URL: `https://your-project.vercel.app`
- Custom domain (if set): `https://yourdomain.com`

Share the link and start helping students manage their budgets! 🚀

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Firebase Docs: https://firebase.google.com/docs
