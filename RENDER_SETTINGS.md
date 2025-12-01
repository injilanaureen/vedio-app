# Render Settings - Exact Configuration

## ⚠️ Important: If Root Directory is "frontend"

### Frontend Service Settings:

1. **Service Type**: `Static Site` (NOT Web Service)

2. **Root Directory**: `frontend` (exactly this, no slash)

3. **Build Command**: 
   ```
   npm install && npm run build
   ```
   ⚠️ DO NOT include `cd frontend` if root directory is already set!

4. **Publish Directory**: `build` (NOT `frontend/build`)

5. **Environment**: `Node` (version 18 or 20)

---

## 🔄 Alternative: If Root Directory is Empty/Blank

1. **Root Directory**: (leave empty or `/`)

2. **Build Command**: 
   ```
   cd frontend && npm install && npm run build
   ```

3. **Publish Directory**: `frontend/build`

---

## ✅ Correct Settings (Root Directory = frontend)

```
Service Type: Static Site
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: build
Environment: Node 18 or 20
```

---

## 🐛 Common Issues

### Issue 1: Still getting "package.json not found"
- **Fix**: Make sure Root Directory is exactly `frontend` (lowercase, no spaces)
- **Fix**: Clear build cache in Render dashboard
- **Fix**: Make sure you're using "Static Site" not "Web Service"

### Issue 2: Build succeeds but site doesn't load
- **Fix**: Check Publish Directory is `build` (not `frontend/build`)
- **Fix**: Make sure `build` folder exists after build

### Issue 3: Build command error
- **Fix**: If Root Directory = `frontend`, build command should be:
  ```
  npm install && npm run build
  ```
  NOT:
  ```
  cd frontend && npm install && npm run build
  ```

---

## 📝 Step-by-Step Fix

1. Go to Render Dashboard → Your Service → Settings
2. Scroll to **Build & Deploy**
3. Set **Root Directory** to: `frontend`
4. Set **Build Command** to: `npm install && npm run build`
5. Set **Publish Directory** to: `build`
6. Click **Save Changes**
7. Go to **Manual Deploy** → **Clear build cache & deploy**

---

## 🔍 Verify Your Settings

After setting root directory to `frontend`, Render will:
- Look for `package.json` in `/opt/render/project/src/frontend/` 
- But it should look in `/opt/render/project/src/` if root is `frontend`

**If it's still looking in wrong place:**
- Try clearing build cache
- Try redeploying
- Check if there's a `render.yaml` file conflicting


