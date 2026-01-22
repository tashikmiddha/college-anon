import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  college: {
    type: String,
    required: true,
    index: true
  },
  anonId: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    default: 'Anonymous'
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'campus-life', 'confession', 'advice', 'humor', 'other'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  reportCount: {
    type: Number,
    default: 0
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationReason: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if post is hot (high engagement)
postSchema.virtual('isHot').get(function() {
  return this.likeCount + this.commentCount > 50;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

export default mongoose.model('Post', postSchema);

