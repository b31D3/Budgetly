# 🔒 Security Quick Start Guide

## What Changed?

**Before:** Admin email was visible in source code ❌
**After:** Admin uses secure server-side custom claims ✅

## Quick Setup (5 Steps)

### 1️⃣ Initialize Firebase Functions

```bash
cd "c:\Users\beide\OneDrive\Desktop\Budgetly"
firebase init functions
```

- Select JavaScript or TypeScript
- Install dependencies: Yes
- ESLint: Yes (recommended)

### 2️⃣ Copy Cloud Function Code

Copy the code from `functions-template.js` into `functions/index.js`

### 3️⃣ Set Secret Key

```bash
firebase functions:config:set admin.secret="ChooseAStrongSecretKey123!"
```

### 4️⃣ Deploy Functions

```bash
firebase deploy --only functions
```

Wait for deployment to complete.

### 5️⃣ Set Admin Claim

Option A - Use setup-admin.html (Recommended):
1. Update `setup-admin.html` with your Firebase config
2. Open it in browser
3. Enter your email and secret key
4. Click "Set Admin Privileges"
5. **DELETE setup-admin.html**

Option B - Use Browser Console:
```javascript
const setAdmin = firebase.functions().httpsCallable('setAdminByEmail');
setAdmin({
  email: 'beidemariamshumet@gmail.com',
  secret: 'ChooseAStrongSecretKey123!'
}).then(result => {
  console.log(result.data.message);
  // Now sign out and sign back in!
});
```

### 6️⃣ Update Firestore Rules

1. Go to Firebase Console
2. Firestore Database → Rules
3. Copy contents from `firestore.rules`
4. Click "Publish"

### 7️⃣ Test It!

1. Sign out
2. Sign back in with admin email
3. Navigate to `/admin`
4. You should now have access!

## Testing Security

### Verify Admin Email is Hidden

```bash
# View the built JavaScript files
View source → Search for "beidemariamshumet"
```

**Expected:** No results! ✅

### Verify Token Claims

```javascript
// In browser console (as admin):
firebase.auth().currentUser.getIdTokenResult()
  .then(token => console.log(token.claims))

// Should show: { admin: true }
```

### Test Non-Admin Access

1. Create another test account
2. Try to access `/admin`
3. Should redirect with "Access denied" ✅

## Security Testing Commands

```javascript
// Check your admin status
const check = firebase.functions().httpsCallable('checkAdminStatus');
check().then(result => console.log(result.data));

// Expected output:
// {
//   uid: "your-uid",
//   email: "beidemariamshumet@gmail.com",
//   isAdmin: true,
//   claims: { admin: true }
// }
```

## ⚠️ Important After Setup

1. **DELETE** `setup-admin.html` from your project
2. **DISABLE** the `setAdminByEmail` Cloud Function:
   ```javascript
   // In functions/index.js, comment out:
   // exports.setAdminByEmail = ...
   ```
3. Redeploy: `firebase deploy --only functions`

## If Something Goes Wrong

### Admin Panel Says "Access Denied"

1. Check your token claims:
   ```javascript
   firebase.auth().currentUser.getIdTokenResult()
     .then(t => console.log(t.claims))
   ```

2. If no admin claim, run setup again
3. Make sure to sign out and sign back in

### Functions Won't Deploy

```bash
# Check you're in the right directory
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Can't Access Firestore Data

1. Check rules are published in Firebase Console
2. Verify you're signed in
3. Check browser console for errors

## Files Created

- ✅ `SECURITY.md` - Complete security documentation
- ✅ `SECURITY_FIXES_SUMMARY.md` - What was fixed
- ✅ `SECURITY_QUICKSTART.md` - This file
- ✅ `firestore.rules` - Production security rules
- ✅ `functions-template.js` - Cloud Functions code
- ✅ `setup-admin.html` - One-time setup tool (delete after use!)
- ✅ `src/pages/Admin.tsx` - Updated with secure auth

## Need Help?

See full documentation: `SECURITY.md`

## Checklist

- [ ] Firebase Functions initialized
- [ ] Cloud Functions deployed
- [ ] Admin secret set
- [ ] Admin claim set on your account
- [ ] Signed out and back in
- [ ] Firestore rules updated
- [ ] Admin panel accessible
- [ ] setup-admin.html deleted
- [ ] setAdminByEmail function disabled
- [ ] Tested non-admin cannot access /admin
- [ ] Verified email not in source code

## Done! 🎉

Your admin panel is now secure. The admin email is completely hidden from client-side code and can only be verified server-side through Firebase custom claims.
