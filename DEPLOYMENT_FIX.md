# Render Deployment Fix

## ❌ Issue
```
npm error path /opt/render/project/src/frontend/package.json
npm error errno -2 Could not read package.json
```

## ✅ Solution

### Option 1: Update Build Command in Render Dashboard

1. Go to your Render service settings
2. Find **Build Command** field
3. Change from: `npm install && npm run build`
4. Change to: `cd frontend && npm install && npm run build`
5. Set **Root Directory** to: (leave empty or set to root)

### Option 2: Set Root Directory

1. In Render Dashboard → Settings
2. Set **Root Directory** to: `frontend`
3. Keep build command as: `npm install && npm run build`

### Option 3: Use render.yaml (Recommended)

1. Add `render.yaml` file to your repo root
2. Render will auto-detect it
3. See `render.yaml` file for configuration

---

## 📝 For Backend Deployment (Separate Service)

Create a **separate** web service for backend:

- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```
  PORT=5000
  MONGO_URI=your-mongodb-connection-string
  EMAIL_USER=admin@gmail.com
  EMAIL_PASS=your-app-password
  ```

---

## 🔧 Quick Fix Steps

1. **Frontend Service**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

2. **Backend Service** (if separate):
   - Root Directory: `backend`
   - Start Command: `npm start`

3. **Update Frontend API URL**:
   - In `frontend/src/api.js`
   - Change `baseURL` to your backend Render URL

---

## ✅ After Fix

Your structure should be:
```
repo/
├── frontend/
│   ├── package.json  ← Render looks here
│   └── src/
├── backend/
│   ├── package.json
│   └── server.js
└── render.yaml
```


