import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  industry: String,
  location: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  skills: [String],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedBy: [
    {
      reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: {
        type: String,
        enum: ['spam', 'harassment', 'inappropriate content', 'fake-account', 'other'],
        required: true,
      },      reportedAt: { type: Date, default: Date.now },
    },
  ],
});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema, 'UserDetails');

export default UserDetails;
