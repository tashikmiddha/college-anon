# Fix Edit Post Functionality

## Issue
The edit option is not working properly - when clicking on edit, users get redirected to home page because there's no route defined for `/edit/:id`.

## Plan
1. ✅ Create EditPost.jsx page component
2. ✅ Add /edit/:id route in App.jsx
3. ✅ Verify postSlice has updatePost async thunk
4. ✅ Verify postAPI has updatePost function

## Completed Changes
- Created `frontend/src/pages/EditPost.jsx` - A new page component for editing posts with:
  - Pre-filled form with existing post data
  - Image upload/removal functionality
  - Authorization check (only author can edit)
  - Proper loading and error states

- Updated `frontend/src/App.jsx`:
  - Added import for EditPost component
  - Added protected route `/edit/:id`

