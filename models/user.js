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
    type: String,
    enum: ['Free', 'Premium'],
    default: 'Free',
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
  },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []  }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []  }],


});

const User = mongoose.model('User', userSchema, 'User');

export default User;
