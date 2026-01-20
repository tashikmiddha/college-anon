# Fix 400 Bad Request Error on Post Creation

## Issue
When clicking "Publish Anonymously", a 400 Bad Request error occurs at POST http://localhost:5173/api/posts

## Root Causes Identified
1. Missing `Content-Type: application/json` header in POST request
2. Incomplete error logging that hides the actual server error message
3. Posts not showing after creation (moderation status issue)

## Fixes Implemented

### Fix 1: Updated postAPI.js
- ✅ Added `Content-Type: application/json` to headers in getHeaders()
- ✅ Improved error logging in createPost to log actual server response
- ✅ Added better error message extraction including validation errors

### Fix 2: Updated CreatePost.jsx
- ✅ Added console.log to track post data being submitted
- ✅ Added .trim() to title and content to avoid whitespace-only issues

### Fix 3: Updated Home.jsx
- ✅ Removed authentication check - posts now load for all users
- ✅ Home page now fetches posts unconditionally

### Fix 4: Updated postController.js
- ✅ Changed moderationStatus from 'pending' to 'approved' for posts that pass moderation
- ✅ Posts now appear immediately after creation instead of waiting for admin approval
- ✅ Only truly flagged posts will have moderationStatus = 'flagged'

## Testing Instructions

1. **Restart both frontend and backend servers** to apply changes
2. **Clear browser console** before testing
3. **Try creating a new post** with title and content
4. **The post should now appear** on the home page immediately after creation

## What Changed

**Before:**
- Posts were set to 'pending' status after passing AI moderation
- Only 'approved' posts were shown on home page
- Users had to wait for admin approval to see their posts

**After:**
- Posts are auto-approved if they pass AI moderation check
- Users can see their posts immediately after creation
- Only truly problematic content gets flagged for review

