import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  industry: String,
  location: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skills: [String],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema, 'UserDetails');

export default UserDetails;
