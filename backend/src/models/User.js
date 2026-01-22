import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  college: {
    type: String,
    required: [true, 'Please select your college'],
    trim: true
  },
  displayName: {
    type: String,
    default: 'Anonymous'
  },
  anonId: {
    type: String,
    unique: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedAt: {
    type: Date,
    default: null
  },
  blockReason: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  
  // Premium Status
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumGrantedAt: {
    type: Date,
    default: null
  },
  premiumExpiresAt: {
    type: Date,
    default: null
  },
  
  // Premium Quotas (admin configurable limits)
  premiumLimits: {
    imageUploads: {
      type: Number,
      default: 10
    },
    competitions: {
      type: Number,
      default: 5
    }
  },
  
  // Premium Usage Tracking
  premiumUsage: {
    imageUploads: {
      type: Number,
      default: 0
    },
    competitions: {
      type: Number,
      default: 0
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate anonymous ID
userSchema.methods.generateAnonId = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Anon_${result}`;
};

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);

