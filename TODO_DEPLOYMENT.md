# Deployment Configuration Tasks

## Frontend Configuration for Vercel + Render Backend

### Step 1: Update vite.config.js
- [ ] Add Vercel rewrites to proxy /api requests
- [ ] Keep local proxy for development
- [ ] Configure proper build settings

### Step 2: Create .env.example
- [ ] Create template with all required environment variables
- [ ] Document each variable

### Step 3: Verify API files
- [ ] Ensure authAPI.js uses VITE_API_URL correctly
- [ ] Ensure postAPI.js uses VITE_API_URL correctly
- [ ] Ensure adminAPI.js uses VITE_API_URL correctly

## Deployment Instructions (after configuration)

### Render Backend:
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables:
   - MONGODB_URI (MongoDB Atlas connection string)
   - JWT_SECRET (secure random string)
   - FRONTEND_URL (your Vercel app URL)
   - Other optional keys (Cloudinary, OpenAI)

### Vercel Frontend:
1. Import your GitHub repository to Vercel
2. Framework Preset: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variables:
   - VITE_API_URL=/api (for Vercel rewrites)
   - Or VITE_API_URL=https://your-render-backend.onrender.com (direct calls)

## Troubleshooting
- If CORS errors occur, ensure FRONTEND_URL is set correctly on Render
- If API calls fail, check that VITE_API_URL is set correctly

