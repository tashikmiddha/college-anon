import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  voteCount: {
    type: Number,
    default: 0
  }
});

const competitionSchema = new mongoose.Schema({
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
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['poll', 'comparison'],
    default: 'comparison'
  },
  options: [optionSchema],
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    optionIndex: {
      type: Number,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update totalVotes before saving
competitionSchema.pre('save', function(next) {
  this.totalVotes = this.options.reduce((sum, opt) => sum + opt.voteCount, 0);
  next();
});

// Check if results are visible (24 hours after expiry)
competitionSchema.methods.areResultsVisible = function() {
  return new Date() >= this.expiresAt;
};

// Check if user has voted
competitionSchema.methods.hasUserVoted = function(userId) {
  return this.voters.some(v => v.user && v.user.toString() === userId.toString());
};

competitionSchema.set('toJSON', { virtuals: true });
competitionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Competition', competitionSchema);

