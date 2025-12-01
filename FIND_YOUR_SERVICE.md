# How to Find Your Frontend Service in Render

## 🔍 Step 1: Login to Render
1. Go to https://dashboard.render.com
2. Login with your account (GitHub/Google/Email)

---

## 🔍 Step 2: Look at the Dashboard

After login, you'll see:

### Option A: You See a List of Services
- Look for a service with name like:
  - `video-app-frontend`
  - `vedio-app-frontend`
  - `frontend`
  - Or any service you created
- **Click on that service name**

### Option B: You See "New +" Button (Empty Dashboard)
- This means you haven't created a service yet
- **Go to Step 3 below to create one**

### Option C: You See Multiple Services
- Look for the one that says **"Static Site"** type
- Or the one with "frontend" in the name
- **Click on it**

---

## 🆕 Step 3: If You Don't Have a Service Yet

### Create New Static Site:

1. Click the **"New +"** button (top right)
2. Click **"Static Site"** from the dropdown
3. Connect your GitHub repository:
   - Click **"Connect account"** if not connected
   - Select your repository: `injilanaureen/vedio-app`
   - Click **"Connect"**
4. Configure the service:
   - **Name**: `video-app-frontend` (or any name)
   - **Branch**: `main` (or your branch name)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
5. Click **"Create Static Site"**

---

## 📍 Visual Guide - What to Look For

### On Render Dashboard, you'll see:

```
┌─────────────────────────────────────────┐
│  Render Dashboard                       │
├─────────────────────────────────────────┤
│                                         │
│  [New +]  button (top right)           │
│                                         │
│  Your Services:                         │
│  ┌───────────────────────────────────┐  │
│  │ video-app-frontend                │  │
│  │ Static Site • main                │  │
│  │ https://xxx.onrender.com          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ video-app-backend                 │  │
│  │ Web Service • main                │  │
│  │ https://xxx.onrender.com          │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Click on the "video-app-frontend" or similar service**

---

## 🔍 Step 4: After Clicking Your Service

You'll see a page with tabs:
- **Overview** (default)
- **Logs**
- **Metrics**
- **Settings** ← **CLICK THIS ONE**
- **Manual Deploy**
- **Environment**

**Click on "Settings" tab**

---

## 📝 Quick Checklist

- [ ] Logged into Render dashboard
- [ ] Found your frontend service (or created new one)
- [ ] Clicked on the service name
- [ ] Clicked "Settings" tab
- [ ] Found "Build & Deploy" section
- [ ] Ready to configure Root Directory, Build Command, Publish Directory

---

## 🆘 Still Can't Find It?

### Check These:
1. **Are you logged into the correct Render account?**
   - The one connected to your GitHub

2. **Did you create the service?**
   - If not, use Step 3 above to create it

3. **Check all services:**
   - Look at the left sidebar
   - Click "Services" if you see it
   - You should see all your services listed

4. **Check if service was deleted:**
   - If you deleted it, create a new one (Step 3)

---

## ✅ Next Steps After Finding Service

Once you click on your service and go to Settings:

1. Scroll to **"Build & Deploy"** section
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Publish Directory**: `build`
5. Click **"Save Changes"**
6. Go to **"Manual Deploy"** tab
7. Click **"Clear build cache & deploy"**


