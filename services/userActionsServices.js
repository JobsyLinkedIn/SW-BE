import UserDetails from '../models/user_details.js';
import { validateDocumentsExistence, areValidObjectIds } from '../utils/validateDB.js';
import mongoose from 'mongoose';
import { postModel as Post, validateCreatePost, validateEditPost } from '../models/post.js';
import User from '../models/user.js';

const savePostService = async (userId, postId) => {
  // Validate IDs
  if (!areValidObjectIds([userId, postId])) {
    throw { status: 400, message: 'Invalid ID(s) provided' };
  }

  // Check if post exists
  if (!validateDocumentsExistence(Post, [postId])) {
    throw { status: 404, message: 'Post not found' };
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
    throw { status: 400, message: 'Invalid ID(s) provided' };
  }

  // Check if post exists
  if (!validateDocumentsExistence(Post, [postId])) {
    throw { status: 404, message: 'Post not found' };
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
    throw { status: 400, message: 'Invalid user ID' };
  }

  const userDetails = await UserDetails.findOne({ user: userId }).populate({
    path: 'savedPosts',
    select: 'author content createdAt',
    options: { skip: (page - 1) * limit, limit: parseInt(limit), sort: { createdAt: -1 } },
  });

  return userDetails?.savedPosts || [];
};

export { savePostService, unsavePostService, getSavedPostsService };
