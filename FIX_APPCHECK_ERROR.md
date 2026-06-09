# 🔧 Firebase App Check - Invalid Token Fix

## ❌ Error You're Seeing
```
Firebase: Error (auth/firebase-app-check-token-is-invalid).
```

This means **App Check is enabled and enforcing token validation** in your Firebase Console.

---

## ✅ Quick Fixes (Choose One)

### **Option 1: Disable App Check (Fastest for Testing)**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Build** → **App Check** (left sidebar)
4. Click on your web app
5. Click the **⋯ (three dots)** menu
6. Select **"Disable enforcement"** or **"Remove"**
7. **Refresh your app** (Ctrl+Shift+R for hard refresh)

✅ **Status**: App will work immediately without App Check

---

### **Option 2: Use Debug Token (Better for Development)**

After disabling enforcement (Option 1):

1. **Refresh the app** → Open DevTools (F12)
2. Look for this in the **Console**:
   ```
   ⚠️ App Check DEBUG MODE enabled. 
   ```
3. You should see a **debug token** printed
4. Copy that token
5. Go back to Firebase Console → **App Check**
6. Click **"Manage debug tokens"** or **"Add debug token"**
7. Paste your debug token
8. **Name it**: `local-dev-token`
9. **Save**
10. **Refresh your app** ✅

---

### **Option 3: Use Real reCAPTCHA v3 (Production)**

1. Get reCAPTCHA v3 Site Key from [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Open [firebase-config.js](firebase-config.js#L140)
3. Replace `YOUR_RECAPTCHA_SITE_KEY` with your real key:
   ```javascript
   provider: new firebase.appCheck.ReCaptchaV3Provider(
     "YOUR_ACTUAL_RECAPTCHA_SITE_KEY_HERE",
   ),
   ```
4. Save and refresh
5. In Firebase Console → App Check → Enable enforcement ✅

---

## 🚀 Recommended for You (Right Now)

**Since you're testing locally:**

1. ✅ **Go to Firebase Console**
2. ✅ **Disable App Check enforcement** (Option 1)
3. ✅ **Refresh your app** (Ctrl+Shift+R)
4. ✅ **Should work immediately!**

---

## 📋 Verify It's Fixed

After disabling enforcement, check:

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Should **NOT see** red error messages
4. Should see green messages:
   ```
   Firebase initialized successfully with project: YOUR_PROJECT_ID
   ✅ Firebase App Check initialized in debug mode
   ```

---

## 🆘 Still Seeing Errors?

Try this:
1. **Hard refresh**: `Ctrl+Shift+Delete` (clears cache)
2. **Open DevTools** → **Network** tab
3. Check for failed requests to `recaptcha.net` or `firebase.googleapis.com`
4. Copy the **full error message** from Console
5. Share it for more help

---

## 📝 Notes

- **Local Development**: Use Option 1 or Option 2
- **Production**: Use Option 3 with real reCAPTCHA key
- **App Check is optional** - your app works fine without it
- Debug tokens are only for development, not production

---

**Next Steps**: Disable App Check enforcement in Firebase Console, then refresh! 🎉
