import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Use local MongoDB
const MONGO_URI = 'mongodb://localhost:27017/college-anon';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  college: {
    type: String,
    required: true,
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
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

async function migrate() {
  try {
    console.log('MongoDB URI:', MONGO_URI);
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', userSchema);
    const collectionName = User.collection.collectionName;

    // Drop the collegeEmail unique index
    console.log(`Dropping old collegeEmail index from ${collectionName} collection...`);

    try {
      const result = await User.collection.dropIndex('collegeEmail_1');
      console.log('Successfully dropped collegeEmail_1 index:', result);
    } catch (indexError) {
      if (indexError.code === 27) {
        console.log('Index collegeEmail_1 does not exist (already dropped or never created)');
      } else if (indexError.message && indexError.message.includes('index not found')) {
        console.log('Index collegeEmail_1 not found (already dropped)');
      } else {
        console.log('Index drop error:', indexError.message);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
