# Invoicr - Quick Test & Verification Guide

## ✅ Pre-Launch Checks

### 1. File Integrity
```
✓ index.html (Main page)
✓ app.js (Frontend logic)
✓ firebase-config.js (Firebase setup)
✓ style.css (Styling)
✓ README.md (Documentation)
```

### 2. Key Features to Test

#### Feature 1: App Loads & Initializes
- [ ] Open `http://localhost:8000` (or double-click `index.html`)
- [ ] Auth screen appears (Sign In / Sign Up tabs visible)
- [ ] Firebase Settings button accessible
- [ ] No JavaScript errors in console

#### Feature 2: Firebase Configuration (Optional)
- [ ] Click **Firebase Settings**
- [ ] Enter Firebase project details (or leave blank to test locally)
- [ ] Click **Save Configuration**
- [ ] App reloads successfully

#### Feature 3: Authentication
- [ ] Click **Sign Up**
- [ ] Enter: Business Name, Email, Password (6+ chars)
- [ ] Verify passwords match
- [ ] Account created successfully
- [ ] Main app loads with sidebar visible

#### Feature 4: Form Inputs
- [ ] Business tab: Enter company details
- [ ] See real-time preview on right side
- [ ] Client tab: Enter client information
- [ ] All fields sync to preview
- [ ] Currency selector works

#### Feature 5: Line Items
- [ ] Click Items tab
- [ ] Add item: Description, Qty, Price, Tax%
- [ ] Item appears in preview table
- [ ] Add multiple items
- [ ] Delete item works
- [ ] Clear All items works

#### Feature 6: Calculations
- [ ] Subtotal calculates correctly
- [ ] Tax calculations accurate
- [ ] Discount shows/hides correctly
- [ ] Shipping shows/hides correctly
- [ ] Grand total updates in real-time
- [ ] Balance Due matches Grand Total

#### Feature 7: Invoicing
- [ ] Upload logo (JPEG/PNG)
- [ ] Logo appears in preview
- [ ] Remove logo works
- [ ] Demo Data button loads sample invoice
- [ ] Reset Form clears everything
- [ ] Print Invoice opens print dialog
- [ ] Download PDF generates file

#### Feature 8: Save & Load
- [ ] Click "Save Invoice"
- [ ] Success toast appears
- [ ] Go to "Saved" tab
- [ ] Saved invoice shows in list
- [ ] Click saved invoice to load
- [ ] Invoice data restores correctly

## 🔍 Console Checks

Open DevTools (F12) and check Console tab:

```javascript
// Should see:
✓ "Firebase initialized successfully with project: YOUR_PROJECT_ID"
✓ "App Check debug token enabled for local development"
✓ "Firebase App Check initialized"
✓ No red error messages
```

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Firebase not configured" | Click Settings → Enter config → Save |
| App Check error | Works offline - debug token auto-enabled on localhost |
| Can't save invoices | Must be signed in (profile widget shows at top) |
| Preview not updating | Check browser console for JS errors |
| PDF not downloading | Check browser popup blocker, try print instead |
| Items not calculating | Ensure qty/price are valid numbers |

## 🚀 How to Run

### Method 1: Direct File (Simplest)
```bash
# Windows
start e:\antigravity\index.html

# Mac
open /path/to/antigravity/index.html

# Linux
firefox /path/to/antigravity/index.html
```

### Method 2: Python Server (Recommended)
```bash
cd e:\antigravity
python -m http.server 8000
# Then open: http://localhost:8000
```

### Method 3: Node.js Server
```bash
cd e:\antigravity
npx http-server
# Then open: http://localhost:8080
```

## 📋 Complete Test Checklist

- [ ] App loads without errors
- [ ] Auth screen displays correctly
- [ ] Can sign up with test account
- [ ] Main app loads after signup
- [ ] Form inputs work and sync to preview
- [ ] Line items can be added/removed
- [ ] Calculations are correct
- [ ] Can save invoices
- [ ] Saved invoices can be loaded
- [ ] PDF export works
- [ ] Print works
- [ ] Demo data loads correctly
- [ ] Reset clears form
- [ ] Logo upload/remove works
- [ ] Currency selector works
- [ ] Tab navigation works

## ✅ Success Criteria

App is **fully functional** when:
1. ✅ Loads without errors
2. ✅ Authentication works
3. ✅ Invoice preview updates in real-time
4. ✅ Can add/manage line items
5. ✅ Calculations accurate
6. ✅ Can save & load invoices
7. ✅ PDF export working

---

**Need help?** Check `README.md` for detailed setup instructions.
