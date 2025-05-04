import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import UserDetails from '../models/user_details.js';
import Profile from '../models/profileModel.js';
import { validateDocumentsExistence, areValidObjectIds } from '../utils/validateDB.js';

import { postModel as Post, validateCreatePost, validateEditPost } from '../models/post.js';
import { commentModel as Comment } from '../models/comments.js';
//import { getUserIdFromToken } from "../services/profileServices.js";
import { getUserIdFromToken } from '../utils/auth.js';

import {
  createPostService,
  getSinglePostService,
  editPostService,
  likePostService,
  addCommentService,
  editCommentService,
  getPostCommentsService,
  getPostLikesService,
  getPostSharesService,
  sharePostService,
  getFeedService,
  deletePostService,
  searchPostsByKeywordService,
  getPostsByUserService,
} from '../services/postService.js';
import { uploadMediaService } from '../services/uploadFiles/uploadFileServices.js';
import { IsSavedPostService } from '../services/userActionsServices.js';

/**-------------------------------------------------------
 *
 * @desc     Create New Post
 * @route   /api/posts
 * @method   POST
 * @access   Private [Only Logged in user]
 *
 *-------------------------------------------------------*/
const createPostCtrl = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { content, taggedUsersIds = [], links = [] } = req.body;
  const UploadedFiles = req.mediaFilesData || [];

  const post = await createPostService({ userId, content, taggedUsersIds, links, UploadedFiles });

  res.status(201).json({ message: 'Post created successfully', post });
});

/**-------------------------------------------------------
 *
 * @desc     Get Current User Posts
 * @route   /api/posts/my-posts
 * @method   GET
 * @access   Private [Only Logged in user]
 *
 *-------------------------------------------------------*/
const getCurrentUserPosts = async (req, res, next) => {
  try {
    const currentUserId = req.user._id; // Assuming user is authenticated and ID is available

    const posts = await getPostsByUserService(currentUserId);

    res.status(200).json({
      success: true,
      userPosts: posts,
      message: 'Current user posts retrieved successfully',
    });
  } catch (error) {
    next(error); // Pass to error handling middleware
  }
};
/**-------------------------------------------------------
 *
 * @desc     Get Single Post
 * @route   /api/posts/:id
 * @method   GET
 * @access   Public
 *
 *-------------------------------------------------------*/
const getSinglePostCtrl = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req?.user?._id ?? null;
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid Post ID' });
  }
  // Call service function
  const post = await getSinglePostService(postId, userId);
  res.status(200).json(post);
});
/**-------------------------------------------------------
 *
 * @desc     Get User Posts
 * @route   /api/posts/user-posts/:userId
 * @method   GET
 * @access   Private [Only Logged in user]
 *
 *-------------------------------------------------------*/
const getUserPostsByIdCtrl = async (req, res, next) => {
  try {
    const userId = req.params.userId; // Get user ID from route params

    const posts = await getPostsByUserService(userId);

    res.status(200).json({
      success: true,
      userPosts: posts,
      message: 'User posts retrieved successfully',
    });
  } catch (error) {
    next(error); // Pass to error handling middleware
  }
};

/**
 * @desc     Get Feed Posts
 * @route    /api/posts/
 * @method   GET
 * @access   Private [Only Logged in user]
 */
const getFeedCtrl = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Extract query parameters (pagination)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Call the service to get feed posts
  const feedData = await getFeedService(userId, page, limit);

  res.status(200).json(feedData);
});

/**-------------------------------------------------------
 *
 * @desc     Edit Post
 * @route   /api/posts/:id
 * @method   PUT
 * @access   Private [Only The Owner of Post]
 *
 *-------------------------------------------------------*/
const editPostCtrl = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Extract post ID and request body
  const postId = req.params.postId;

  const { content, taggedUsersIds = [], links = [], UploadedFiles = [] } = req.body;
  const postData = { content, taggedUsersIds, links, UploadedFiles, userId };

  // Call service function
  const updatedPost = await editPostService(postId, postData);

  // Return response
  res.status(200).json({ message: 'Post updated successfully', updatedPost });
});

/**-------------------------------------------------------
 *
 * @desc     Like/Unlike Post
 * @route   /api/posts/like/:postId
 * @method   PUT
 * @access   Private [Only Logged in User]
 *
 *-------------------------------------------------------*/
const likePostCtrl = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const response = await likePostService(postId, userId);

  res.status(200).json(response);
});

/**-------------------------------------------------------
 *
 * @desc     add comment to Post
 * @route   /api/posts/comment/:id
 * @method   POST
 * @access   Private [Only Logged in User]
 *
 *-------------------------------------------------------*/

const addCommentCtrl = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const { content = null, taggedUsersIds = [] } = req.body;

  const userId = req.user._id;

  // Call Service
  const comment = await addCommentService({ postId, userId, content, taggedUsersIds });

  res.status(201).json({ message: 'Comment added successfully', comment });
});

/**-------------------------------------------------------
 *
 * @desc     Delete comment
 * @route   /api/posts/comment/:id
 * @method   DELETE
 * @access   Private [Only Comment Writer]
 *
 *-------------------------------------------------------*/
/*
const deleteCommentCtrl = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user._id;
  // ✅ Call service function
  await deleteCommentService(commentId, userId);

  res.status(200).json({ message: 'Comment deleted successfully' });
});
*/

/**-------------------------------------------------------
 *
 * @desc     Edit comment
 * @route   /api/posts/comment/:id
 * @method   PUT
 * @access   Private [Only Comment Writer]
 *
 *-------------------------------------------------------*/

const editCommentCtrl = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const { content = null, taggedUsersIds = [] } = req.body;

  const userId = req.user._id;

  // ✅ Call Service
  const updatedComment = await editCommentService(commentId, { content, taggedUsersIds, userId });

  res.status(200).json({ message: 'Comment updated successfully', updatedComment });
});

/**
 *
 * @desc    Get comments of a post with pagination.
 * @route   GET /api/posts/:id/comments
 * @method  GET
 * @access  Private [Only Logged In Users]
 * @query   page (default: 1), limit (default: 10)
 */

const getPostCommentsCtrl = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req?.user?._id ?? null;
  let { page = 1, limit = 10 } = req.query;

  // Convert to numbers
  page = parseInt(page);
  limit = parseInt(limit);

  // ✅ Call Service
  const { totalComments, totalPages, comments } = await getPostCommentsService(postId,userId, page, limit);

  res.status(200).json({ totalComments, page, totalPages, comments });
});

/**
 * @desc Get users who liked a post
 * @route GET /api/posts/:id/likes
 * @access Public
 * * @query   page (default: 1), limit (default: 10)
 */

const getPostLikesCtrl = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  let { page = 1, limit = 10 } = req.query;

  // Convert to numbers
  page = parseInt(page);
  limit = parseInt(limit);

  // ✅ Call Service
  const { likes, currentPage, totalPages, totalLikesCount } = await getPostLikesService(
    postId,
    page,
    limit
  );

  res.status(200).json({
    message: 'Post likes retrieved successfully',
    likes: likes,
    currentPage: currentPage,
    totalPages: totalPages,
    totalLikesCount: totalLikesCount,
  });
});

/**
 * @desc    Get users who shared a specific post
 * @route   GET /api/posts/:id/shares
 * @access  Public
 *  @query   page (default: 1), limit (default: 10)
 */

const getPostSharesCtrl = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  let { page = 1, limit = 10 } = req.query;

  // Convert to numbers
  page = parseInt(page);
  limit = parseInt(limit);

  // ✅ Call Service
  const { shares, currentPage, totalPages, totalSharesCount } = await getPostSharesService(
    postId,
    page,
    limit
  );

  res.status(200).json({
    message: 'Post shares retrieved successfully',
    shares,
    currentPage,
    totalPages,
    totalSharesCount,
  });
});

/**-------------------------------------------------------
 *
 * @desc     Share  Post
 * @route    /api/posts/:id/shares
 * @method   POST
 * @access   Private [Only Logged in User]
 *
 *-------------------------------------------------------*/
const sharePostCtrl = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sharedPostId = req.params.postId;
  const { content = '', taggedUsersIds = [] } = req.body;

  const sharedPost = await sharePostService({ userId, sharedPostId, content, taggedUsersIds });

  res.status(201).json({ message: 'Post shared successfully', sharedPost });
});

/**-------------------------------------------------------
 *
 * @desc     Search By Keywords
 * @route    /api/posts/search
 * @method   GET
 * @access   Private [Only Logged in User]
 *
 *-------------------------------------------------------*/

const searchPostsCtrl = async (req, res) => {
  try {
    const { keyword } = req.query;
    const posts = await searchPostsByKeywordService(keyword);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error searching posts', error: error.message });
  }
};

/**-------------------------------------------------------
 *
 * @desc     Delete Post
 * @route   /api/posts/:id
 * @method   DELETE
 * @access   Private [Only The Owner of Post Or Admin]
 *
 *-------------------------------------------------------*/
const deletePostCtrl = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const postId = req.params.postId;
  const message = await deletePostService(postId, userId);
  res.status(200).json({ message });
});

/**-------------------------------------------------------
 *
 * @desc    Upload Media In The message
 * @route   /api/posts/upload
 * @method   POST
 * @access   Private [Only Logged in user]
 *
 *-------------------------------------------------------*/
const uploadMediaCtrl = asyncHandler(async (req, res) => {
  const UploadedFiles = req.mediaFilesData || [];

  const uploadMediaData = uploadMediaService(UploadedFiles);

  res.status(201).json({ message: 'The files have been uploaded successfully', uploadMediaData });
});

const isSavedPostCtrl = async (req, res, next) => {
  try {
    // Get IDs - supports both params and body
    const userId = req.user._id;
    const postId = req.params.postId || req.body.postId;

    if (!userId || !postId) {
      const error = new Error('User ID and Post ID are required');
      error.statusCode = 400;
      throw error;
    }

    const isSaved = await IsSavedPostService(userId, postId);

    res.status(200).json({
      isSaved: isSaved,
      message: isSaved ? 'Post is saved by the user' : 'Post is not saved by the user',
    });
  } catch (error) {
    // Ensure statusCode exists
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};
export {
  createPostCtrl,
  getSinglePostCtrl,
  getFeedCtrl,
  editPostCtrl,
  likePostCtrl,
  addCommentCtrl,
  editCommentCtrl,
  getPostCommentsCtrl,
  getPostLikesCtrl,
  getPostSharesCtrl,
  sharePostCtrl,
  deletePostCtrl,
  searchPostsCtrl,
  uploadMediaCtrl,
  getCurrentUserPosts,
  getUserPostsByIdCtrl,
  isSavedPostCtrl,
};
