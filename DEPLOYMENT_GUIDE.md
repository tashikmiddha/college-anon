# Deployment Guide for CollegeAnon

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   MongoDB       │
│   (Vercel)      │     │   (Render)      │     │   (Atlas)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Prerequisites

1. **GitHub Account** - For hosting your code
2. **MongoDB Atlas Account** - Free tier available
3. **OpenAI Account** - For AI moderation (paid API)
4. **Vercel Account** - Free for frontend
5. **Render Account** - Free for backend

---

## Step 1: Push Code to GitHub

```bash
cd /Users/tashikmiddha/Desktop/bloging/college-anon
git init
git add .
git commit -m "Initial commit"
gh repo create college-anon-backend --public --source=. --push
```

---

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create free cluster (AWS free tier recommended)
3. Create database user with read/write permissions
4. Network Access: Add `0.0.0.0/0` (allow all IPs) or your cloud IPs
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/college-anon?retryWrites=true&w=majority
   ```

---

## Step 3: Deploy Backend on Render

### Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. New → Web Service
3. Connect your GitHub repository
4. Configure:

   | Setting | Value |
   |---------|-------|
   | Name | college-anon-backend |
   | Root Directory | college-anon/backend |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free |

5. Environment Variables (in Settings tab):

   ```env
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-key-min-32-characters
   JWT_EXPIRE=7d
   OPENAI_API_KEY=sk-your-openai-key
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. Click "Create Web Service"

### Get Backend URL
After deployment, you'll get a URL like:
```
https://college-anon-backend.onrender.com
```

---

## Step 4: Deploy Frontend on Vercel

### Option A: Vercel CLI

```bash
cd /Users/tashikmiddha/Desktop/bloging/college-anon/frontend
vercel login
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Add New Project
3. Import from GitHub
4. Configure:

   | Setting | Value |
   |---------|-------|
   | Root Directory | `college-anon/frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

5. Environment Variables:

   ```env
   VITE_API_URL=https://your-render-backend.onrender.com
   ```

6. Click "Deploy"

### Update CORS on Backend

Add your Vercel URL to Render environment variables:
```
FRONTEND_URL=https://your-project.vercel.app
```

---

## Step 5: Update Frontend API Base URL

Edit `frontend/src/features/auth/authAPI.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api/auth';
```

Or set environment variable:
```env
VITE_API_URL=https://college-anon-backend.onrender.com
```

---

## Step 6: Verify Deployment

1. **Backend Health Check**:
   ```
   https://your-render-backend.onrender.com/health
   ```

2. **Test Registration**:
   ```bash
   curl -X POST https://your-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","collegeEmail":"test@college.edu"}'
   ```

3. **Frontend**: Visit your Vercel URL

---

## Scalability Considerations

### Current Limitations (for 100s of users, OK. For 1000s+, needs upgrades)

| Component | Current | For Scale |
|-----------|---------|-----------|
| Server | Single instance | Load balancer + multiple instances |
| Database | MongoDB Atlas | Sharding for large data |
| Rate Limiting | In-memory | Redis for distributed rate limiting |
| Static Assets | Vercel CDN | Already optimized |
| Caching | None | Redis cache for posts |
| AI Moderation | OpenAI API | Queue system (bullMQ) |

### Scaling Recommendations (for 10,000+ users)

1. **Backend**:
   - Use Render's paid tier for auto-scaling
   - Add Redis for session storage and caching
   - Implement database connection pooling

2. **Database**:
   - MongoDB Atlas M10+ tier
   - Add indexes on frequently queried fields
   - Consider read replicas

3. **AI Moderation**:
   - Implement message queue (BullMQ + Redis)
   - Cache moderation results
   - Add human review queue for edge cases

---

## Cost Estimation (Free Tier)

| Service | Free Tier | Cost |
|---------|-----------|------|
| MongoDB Atlas | 512 MB storage | $0 |
| Render | 750 hours/month | $0 |
| Vercel | 100 GB bandwidth | $0 |
| OpenAI | Pay per use | ~$0.01/1000 tokens |

**Total: ~$0-5/month depending on usage**

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in Render
- Check that frontend is calling the correct backend URL

### 500 Errors
- Check Render logs (Dashboard → Logs)
- Verify MongoDB URI is correct
- Ensure all required env vars are set

### Slow Performance
- Enable compression (already in code)
- Add Redis caching
- Optimize MongoDB queries

---

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-32-char-secret
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...
FRONTEND_URL=https://*.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-render-app.onrender.com
```

> Note: In development, the proxy in `vite.config.js` handles API requests. In production, set `VITE_API_URL` to your Render backend URL.

