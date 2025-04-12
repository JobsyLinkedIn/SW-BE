import UserDetails from '../models/user_details.js';
import { validateDocumentsExistence, areValidObjectIds } from '../utils/validateDB.js';
import mongoose from 'mongoose';
import { postModel as Post, validateCreatePost, validateEditPost } from '../models/post.js';
import User from '../models/user.js';

const savePostService = async (userId, postId) => {
  // Validate IDs
  if (!areValidObjectIds([userId, postId])) {
    const error = new Error('Invalid ID(s) provided');
    error.statusCode = 400;
    throw error;
  }
  // Check if post exists
  const PostIsExist = await validateDocumentsExistence(Post, [postId]);
  if (!PostIsExist) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // Update userDetails to save post
  const updatedUserDetails = await UserDetails.findOneAndUpdate(
    { user: userId },
    { $addToSet: { savedPosts: postId } }, // Prevent duplicates
    { new: true, upsert: true } // Create document if not found
  );

  await Post.findByIdAndUpdate(postId, {
    $inc: { savesCount: 1 },
  });

  return updatedUserDetails;
};

const unsavePostService = async (userId, postId) => {
  // Validate IDs
  if (!areValidObjectIds([userId, postId])) {
    const error = new Error('Invalid ID(s) provided');
    error.statusCode = 400;
    throw error;
  }

  // Check if post exists
  const PostIsExist = await validateDocumentsExistence(Post, [postId]);
  if (!PostIsExist) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // Update userDetails to remove saved post
  const updatedUserDetails = await UserDetails.findOneAndUpdate(
    { user: userId },
    { $pull: { savedPosts: postId } },
    { new: true }
  );
  await Post.findByIdAndUpdate(postId, {
    $inc: { savesCount: -1 },
  });
  return updatedUserDetails;
};

const getSavedPostsService = async (userId, page = 1, limit = 10) => {
  if (!areValidObjectIds([userId])) {
    const error = new Error('Invalid user ID');
    error.statusCode = 400;
    throw error;
  }

  const userDetails = await UserDetails.findOne({ user: userId }).populate({
    path: 'savedPosts',
    select: 'author content createdAt',
    options: { skip: (page - 1) * limit, limit: parseInt(limit), sort: { createdAt: -1 } },
  });

  return userDetails?.savedPosts || [];
};

export { savePostService, unsavePostService, getSavedPostsService };
