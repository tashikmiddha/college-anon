import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition'
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'hate-speech', 'violence', 'misinformation', 'inappropriate', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying - either post or competition must be provided
reportSchema.index({ post: 1, reporter: 1 }, { sparse: true, unique: true });
reportSchema.index({ competition: 1, reporter: 1 }, { sparse: true, unique: true });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

// Validate that either post or competition is provided
reportSchema.pre('save', function(next) {
  if (!this.post && !this.competition) {
    return next(new Error('Either post or competition must be provided'));
  }
  next();
});

export default mongoose.model('Report', reportSchema);

