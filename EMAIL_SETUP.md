# Gmail Email Setup - Step by Step

## ❌ Error
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

## ✅ Solution: Gmail App Password Setup

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Find **"2-Step Verification"**
3. Click and enable it (if not already enabled)
4. Follow the setup process

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Or: Google Account → Security → 2-Step Verification → App passwords
3. Select app: **"Mail"**
4. Select device: **"Other (Custom name)"**
5. Enter name: **"Video App"**
6. Click **"Generate"**
7. Copy the 16-character password (no spaces): `xxxx xxxx xxxx xxxx`

### Step 3: Set Environment Variables on Render

1. Go to Render Dashboard → Backend Service (`vedio-app-4pme`)
2. Settings → Environment Variables
3. Add these variables:

**Variable 1:**
- Key: `EMAIL_USER`
- Value: `your-email@gmail.com` (your actual Gmail)

**Variable 2:**
- Key: `EMAIL_PASS`
- Value: `xxxxxxxxxxxxxxxx` (16-character app password, NO SPACES)

### Step 4: Save & Redeploy
1. Click **Save Changes**
2. Go to **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment

---

## 📝 Example

```
EMAIL_USER=admin@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Important:** Remove spaces from app password:
```
EMAIL_PASS=abcdefghijklmnop
```

---

## ✅ After Setup

1. Test email sending from admin dashboard
2. Should work without errors
3. Check recipient's inbox (and spam folder)

---

## 🚨 Common Issues

### Issue 1: "Bad Credentials"
- **Fix**: Make sure you're using App Password, not regular password
- **Fix**: Remove spaces from app password

### Issue 2: "Less secure app"
- **Fix**: Use App Password (more secure than "less secure apps")

### Issue 3: Still not working
- **Fix**: Regenerate app password
- **Fix**: Make sure 2-Step Verification is enabled
- **Fix**: Wait 5-10 minutes after generating password

---

## 🔒 Security Note

- Never commit `.env` file with real credentials
- App Password is safer than regular password
- Can revoke app password anytime from Google Account

