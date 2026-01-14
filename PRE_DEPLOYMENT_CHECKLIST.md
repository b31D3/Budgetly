# 📋 Pre-Deployment Checklist

## Before You Deploy to Vercel

### 🔐 Security (CRITICAL)

- [ ] **Delete** `setup-admin.html` from project
  ```bash
  rm setup-admin.html
  git add .
  git commit -m "Remove admin setup file"
  ```

- [ ] **Verify** `.env` is in `.gitignore`
  ```bash
  cat .gitignore | grep .env
  # Should show .env files listed
  ```

- [ ] **Check** no sensitive data in code
  ```bash
  # Search for hardcoded credentials
  grep -r "password" src/
  grep -r "secret" src/
  grep -r "apikey" src/
  # Should find nothing suspicious
  ```

- [ ] **Firebase security rules** deployed
  - Go to Firebase Console
  - Firestore Database → Rules
  - Copy from `firestore.rules`
  - Click "Publish"

- [ ] **Admin custom claims** set up (if using admin panel)
  - Cloud Functions deployed
  - Admin claim set via function
  - Function disabled/deleted after use

### 🧪 Testing

- [ ] **Build succeeds locally**
  ```bash
  npm run build
  # Should complete without errors
  ```

- [ ] **Preview build locally**
  ```bash
  npm run preview
  # Open http://localhost:4173
  # Test all features
  ```

- [ ] **All pages work**
  - [ ] Homepage
  - [ ] Sign Up
  - [ ] Sign In
  - [ ] Calculator
  - [ ] Dashboard
  - [ ] Scenarios
  - [ ] Settings
  - [ ] Admin Panel (if applicable)

- [ ] **Forms work correctly**
  - [ ] Calculator calculates properly
  - [ ] Scenarios save/update/delete
  - [ ] Transactions add/edit/delete
  - [ ] Feedback submits

- [ ] **Authentication works**
  - [ ] Can sign up new user
  - [ ] Can sign in existing user
  - [ ] Can sign out
  - [ ] Protected routes redirect to sign in

- [ ] **Mobile responsive**
  - [ ] Test on mobile viewport (Chrome DevTools)
  - [ ] All buttons clickable
  - [ ] Text readable
  - [ ] Forms usable

### 📝 Configuration Files

- [ ] **`vercel.json` exists** (already created ✅)

- [ ] **`package.json` has correct scripts**
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```

- [ ] **`.gitignore` is complete**
  - node_modules
  - dist
  - .env files
  - Firebase debug logs
  - setup-admin.html

### 🔧 Environment Variables Ready

Prepare these values (from Firebase Console):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

**Where to find:**
- Firebase Console
- Project Settings (⚙️)
- "Your apps" section
- Copy SDK config values

### 📦 Dependencies

- [ ] **All dependencies installed**
  ```bash
  npm install
  ```

- [ ] **No critical vulnerabilities**
  ```bash
  npm audit
  # Fix any critical issues
  ```

- [ ] **Build size acceptable**
  ```bash
  npm run build
  # Check dist/ folder size
  # Should be under 5MB
  ```

### 🌐 Git Repository

- [ ] **Code committed to git**
  ```bash
  git status
  # Should show "nothing to commit, working tree clean"
  ```

- [ ] **Pushed to GitHub/GitLab/Bitbucket**
  ```bash
  git push origin main
  ```

- [ ] **Repository is public or accessible by Vercel**

### 🔥 Firebase Configuration

- [ ] **Firebase project exists**
- [ ] **Authentication enabled**
  - Email/Password provider enabled

- [ ] **Firestore database created**
  - Collections: calculations, scenarios, feedback

- [ ] **Storage bucket created** (for profile pictures)

- [ ] **Authorized domains** will include Vercel domain
  - Note: You'll add this AFTER deployment

### 🚀 Ready to Deploy!

Once all items are checked:

1. Go to https://vercel.com/new
2. Import your Git repository
3. Add environment variables
4. Click "Deploy"
5. Wait for build (1-3 minutes)
6. Get your deployment URL
7. Add URL to Firebase Authorized Domains
8. Test deployed site thoroughly

### 🎯 Post-Deployment Tasks

After deployment succeeds:

- [ ] **Test deployed site**
  - Sign up new user
  - Create calculation
  - Test all features

- [ ] **Add domain to Firebase**
  - Firebase Console
  - Authentication → Settings → Authorized domains
  - Add your-app.vercel.app

- [ ] **Set up custom domain** (optional)
  - Vercel Dashboard → Domains
  - Add your domain
  - Configure DNS

- [ ] **Enable analytics** (optional)
  ```bash
  npm install @vercel/analytics
  # Add to main.tsx
  ```

- [ ] **Test on real devices**
  - Share link with friends
  - Test on iOS and Android
  - Check different browsers

- [ ] **Monitor first 24 hours**
  - Check Vercel Dashboard for errors
  - Monitor Firebase usage
  - Watch for any issues

### ⚠️ Common Issues to Check

- [ ] **Environment variables all set** (most common issue)
- [ ] **Firebase domain authorized** (second most common)
- [ ] **Build output directory is** `dist` **not** `build`
- [ ] **All routes work** (404 issues)
- [ ] **Images load correctly**
- [ ] **No console errors in production**

### 📊 Success Metrics

After deployment, verify:
- [ ] Lighthouse score > 90
- [ ] Page loads in < 3 seconds
- [ ] No JavaScript errors in console
- [ ] All links work
- [ ] Forms submit successfully
- [ ] Authentication works
- [ ] Mobile experience is smooth

## 🎉 Ready to Launch!

When everything is checked, you're ready to deploy!

```bash
# Final check
npm run build

# If successful, you're good to go! 🚀
```

Follow the steps in `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.
