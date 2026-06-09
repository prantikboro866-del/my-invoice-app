# Invoicr - Invoice Generator

A clean, modern invoice generation web app with Firebase integration for cloud storage.

## 🚀 Quick Start

### Option 1: Local Testing (No Firebase Required)

1. Open `index.html` in your browser (double-click or use a local server)
2. Click **Firebase Settings** → Configure with any Firebase project or test values
3. Use **Sign Up** to create a test account
4. Start creating invoices!

### Option 2: Local Server (Recommended)

```bash
# Using Python 3
python -m http.server 8000

# OR using Node.js http-server
npx http-server
```

Then open: `http://localhost:8000`

## 🔧 Setup with Firebase (Optional)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** (start in test mode)

### Step 2: Get Your Config
1. In Firebase Console, go to Project Settings
2. Copy your config values:
   - API Key
   - Project ID
   - Auth Domain
   - Storage Bucket

### Step 3: Configure Invoicr
1. Launch the app
2. Click **Firebase Settings**
3. Paste your config values
4. Click **Save Configuration**
5. Refresh the page

### Step 4: Handle App Check (if needed)

**For Local Development:**
- App Check debug token is automatically enabled on `localhost`
- Copy the debug token from browser console
- Add it in Firebase Console → App Check

**For Production:**
- Enable reCAPTCHA v3 in Firebase Console
- Generate reCAPTCHA site key at [Google reCAPTCHA](https://www.google.com/recaptcha/admin)

## 📋 Features

✅ **Live Preview** - Real-time A4 invoice preview  
✅ **Item Management** - Add/remove line items with tax support  
✅ **Cloud Sync** - Save invoices to Firebase (when configured)  
✅ **Print & Export** - Print or download as PDF  
✅ **Logo Upload** - Add company logo (stored as Base64)  
✅ **Auto-Calculate** - Subtotals, taxes, discounts, shipping  
✅ **Demo Data** - Pre-loaded sample invoice for testing  
✅ **Local Storage** - Fallback storage when not authenticated  

## 📁 File Structure

```
invoicr/
├── index.html           # Main HTML
├── app.js              # Core JavaScript logic
├── firebase-config.js  # Firebase initialization
├── style.css           # Styling (Blue & White theme)
└── README.md           # This file
```

## 🎨 Customization

### Change Theme Colors
Edit [style.css](style.css) - CSS variables at the top:
```css
:root {
    --primary: #1e3a8a;        /* Change to your brand color */
    --accent: #2563eb;
    /* ... etc ... */
}
```

### Default Invoice Metadata
Edit [app.js](app.js) - `loadDemoData()` function around line 864

## ⚠️ Troubleshooting

### "Firebase not configured"
- Click **Firebase Settings** and enter your project details
- Check that your config values match Firebase Console

### App Check Errors
- On localhost: Debug token auto-activates (check browser console)
- On production: Add your generated debug token to Firebase Console

### Firestore Errors
- Ensure Firestore is enabled in Firebase Console
- Check that "Email/Password" auth is enabled
- Review Firestore rules (default test mode: allow read/write)

### Invoice Not Saving
- Ensure you're signed in (profile widget shows in sidebar)
- Check browser console for Firebase errors
- Verify Firestore has write permissions

## 📝 Demo Account

Once configured, sign up with any email/password:
- **Email**: test@example.com
- **Password**: Test123!

The app auto-loads demo invoice data on first visit.

## 🔐 Security Notes

- Always use HTTPS in production
- Never commit real Firebase keys to version control
- Use Firestore security rules in production (test mode only for development)
- Rotate your API keys regularly

## 📦 Dependencies

- **Firebase 10.8.0** (compat SDK)
- **Lucide Icons** (SVG icons)
- **html2pdf** (PDF export)
- **TailwindCSS** (styling, via CSS variables)

## 📜 License

Open source. Feel free to modify and use!

---

**Questions?** Check the browser console for detailed error logs.
