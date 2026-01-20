# CollegeAnon - Anonymous College Blogging Platform

A full-stack anonymous blogging platform designed for college students. Share thoughts, confessions, advice, and more while maintaining complete anonymity.

## Features

### For Students
- 🔒 **Complete Anonymity** - Posts are identified only by anonymous IDs
- 📝 **Create Posts** - Share thoughts with categories and tags
- ❤️ **Like & Interact** - Engage with other posts
- 🚩 **Report System** - Report inappropriate content
- 🔄 **Refresh ID** - Generate new anonymous identity anytime

### For Moderators/Admins
- 📊 **Dashboard** - Overview of platform statistics
- ✓ **Content Moderation** - Review and approve/reject posts
- 🚨 **Report Management** - Handle user reports
- 👥 **User Management** - View and manage users

### Technical Features
- AI-powered content moderation (OpenAI)
- Rate limiting for security
- JWT authentication
- MongoDB database
- React + Redux frontend
- Express.js backend

## Tech Stack

### Frontend
- React 18
- Redux Toolkit
- React Router v6
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- OpenAI API for moderation

## Project Structure

```
college-anon/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── app/           # Redux store configuration
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Redux slices and API services
│   │   │   ├── auth/      # Authentication logic
│   │   │   ├── posts/     # Posts management
│   │   │   └── admin/     # Admin features
│   │   └── pages/         # Page components
│   └── ...
├── backend/                # Express backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── ai/           # AI moderation logic
│   │   └── utils/        # Utility functions
│   └── ...
└── .env                   # Environment variables
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd college-anon
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**
   
   Edit the `.env` file in the root directory:
   ```env
   # Server
   PORT=5000
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/college-anon
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d
   
   # OpenAI (optional - for content moderation)
   OPENAI_API_KEY=your-openai-api-key
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running locally or update the `MONGODB_URI` to point to your MongoDB Atlas instance.

6. **Run the Backend**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

7. **Run the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

### Creating an Admin User

To create an admin user, you'll need to manually set the `isAdmin` field in the database:

1. Register a new user through the frontend
2. Access MongoDB (using Compass or CLI)
3. Find the user document and set `isAdmin: true`

```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isAdmin: true } }
)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/refresh-anon-id` - Generate new anonymous ID

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth + ownership)
- `DELETE /api/posts/:id` - Delete post (auth + ownership)
- `POST /api/posts/:id/like` - Like/unlike post (auth)
- `GET /api/posts/user/my-posts` - Get user's posts (auth)
- `POST /api/posts/:id/report` - Report post (auth)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/posts` - Get all posts for moderation
- `PUT /api/admin/posts/:id/moderate` - Moderate a post
- `GET /api/admin/reports` - Get pending reports
- `PUT /api/admin/reports/:id/resolve` - Resolve a report
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-admin` - Toggle admin status

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | localhost:27017/college-anon |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| OPENAI_API_KEY | OpenAI API key for moderation | - |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## Content Moderation

The platform uses OpenAI's moderation API to automatically flag potentially inappropriate content. Posts flagged by AI require admin approval before becoming visible to the public.

Without an OpenAI API key, posts will be set to `pending` moderation status by default and require manual approval.

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for password security
- **Input Sanitization**: XSS protection
- **CORS**: Configured for frontend-backend communication

## License

MIT License - feel free to use this project for your college!

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to production using free cloud services (Vercel + Render + MongoDB Atlas).

