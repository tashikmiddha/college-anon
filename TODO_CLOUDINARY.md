# Cloudinary Image Upload Implementation

## Overview
Add image upload functionality to the anonymous blogging platform using Cloudinary.

## Tasks

### Backend Setup
- [ ] 1. Add cloudinary package to backend/package.json
- [ ] 2. Create backend/src/config/cloudinary.js configuration
- [ ] 3. Add cloudinary config to backend/src/config/env.js
- [ ] 4. Update Post model to include image field
- [ ] 5. Add upload endpoint to postRoutes.js
- [ ] 6. Update postController.js for multipart handling

### Frontend Changes
- [ ] 7. Update CreatePost.jsx with file upload UI
- [ ] 8. Update postAPI.js for multipart/form-data
- [ ] 9. Update PostCard.jsx to display images
- [ ] 10. Update PostDetail.jsx to show full images

### Configuration
- [ ] 11. Update .env.example with Cloudinary variables

## Implementation Steps

### Step 1: Backend Package.json
Add cloudinary and multer for handling multipart/form-data:
```bash
npm install cloudinary multer
```

### Step 2: Cloudinary Config
Create configuration file with upload settings and image optimization.

### Step 3: Post Model Update
Add image field to store Cloudinary URL and public_id.

### Step 4: File Upload Endpoint
Create POST /api/upload endpoint for image uploads.

### Step 5: Frontend Integration
Add file input, preview, and upload functionality.

## Environment Variables Needed
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Image Specifications
- Max file size: 5MB
- Allowed formats: jpg, jpeg, png, gif, webp
- Auto-optimization enabled via Cloudinary

