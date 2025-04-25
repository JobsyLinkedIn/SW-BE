import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  coverPicture: String,
  profilePicture: String,
  resume: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
  },
  hasSelectedPlan: {
    type: Boolean,
    default: false,
  },
  subscriptionStart: {
    type: Date,
    default: null,
  },
  subscriptionEnd: {
    type: Date,
    default: null,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
  },
  connectionPrivacy: {
    type: String,
    enum: ['everyone',  'no-one'],
    default: 'everyone',
  },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
});

const User = mongoose.model('User', userSchema, 'User');

export default User;
