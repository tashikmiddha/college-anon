import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
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
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Comment cannot be more than 2000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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
commentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Comment', commentSchema);

