// services/postService.js
import mongoose from 'mongoose';
import { postModel as Post, validateCreatePost, validateEditPost } from '../models/post.js';
import { commentModel as Comment } from '../models/comments.js';
import User from '../models/user.js';
import UserDetails from '../models/user_details.js';
import Profile from '..//models/profileModel.js';
import { getUserIdFromToken } from '../utils/auth.js';
import { validateDocumentsExistence, areValidObjectIds } from '../utils/validateDB.js';
import deleteFileFromCloudinary from '../utils/cloudinaryHelpers.js';

const createPostService = async ({
  userId,
  content,
  taggedUsersIds = [],
  links = [],
  UploadedFiles = [],
}) => {
  // TODO: Handle Uploaded Media (Implementation Pending)

  // ✅ Validate Post Data
  const { error } = validateCreatePost({ content, taggedUsersIds, links });
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  // ✅ Validate Tagged Users Exist
  if (!areValidObjectIds(taggedUsersIds) || !validateDocumentsExistence(User, taggedUsersIds)) {
    const error = new Error('One or more tagged users do not exist');
    error.statusCode = 400;
    throw error;
  }
  // ✅ Get Uploaded Media (images,video) In the Post
  let media = [];
  if (UploadedFiles.length !== 0) {
    media = UploadedFiles.map((file) => ({
      publicId: file.public_id,
      url: file.secure_url,
      type: file.resource_type,
    }));
  }

  // ✅ Create and Save the Post
  const post = await Post.create({
    author: userId,
    content,
    taggedUsers: taggedUsersIds,
    links,
    media,
  });

  return post;
};

const getSinglePostService = async (postId) => {
  const post = await Post.findById(postId)
    .populate('author', 'name profilePicture')
    .populate('taggedUsers', 'name');

  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  return post.toObject();
};

/**
 * @desc Get Feed Posts
 * @param {String} userId - The ID of the logged-in user
 * @param {Number} page - Current page number (for pagination)
 * @param {Number} limit - Number of posts per page
 * @returns {Object} Feed posts with pagination data
 */
const getFeedService = async (userId, page = 1, limit = 10) => {
  // Fetch user profile to get followers and connections
  const [userProfile, userDetails] = await Promise.all([
    Profile.findOne({ userId }).select('followers'),
    UserDetails.findOne({ user: userId }).select('connections'),
  ]);

  const followedUsers = userProfile?.followers || [];
  const connections = userDetails?.connections || [];
  const feedUsers = [...followedUsers, ...connections, userId]; // Include self-posts

  // Pagination calculations
  const skip = (page - 1) * limit;

  // Fetch paginated posts
  const feedPosts = await Post.find({ author: { $in: feedUsers } })
    .populate('author', 'name profilePicture')
    .populate('taggedUsers', 'name')
    .sort({ createdAt: -1 }) // Latest posts first
    .skip(skip)
    .limit(limit);

  // Get total count for pagination metadata
  const totalPosts = await Post.countDocuments({ author: { $in: feedUsers } });

  return {
    posts: feedPosts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
  };
};

const editPostService = async (
  postId,
  { content, taggedUsersIds = [], links = [], UploadedFiles = [], userId }
) => {
  // ✅ Validate Post ObjectId
  if (!areValidObjectIds([postId])) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
  // Ensure post exists
  const post = await Post.findById(postId).populate('taggedUsers', 'name');
  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure only author can edit
  if (post.author.toString() !== userId) {
    const error = new Error('You are not authorized to edit this post');
    error.statusCode = 403; // Forbidden
    error.code = 'UNAUTHORIZED_ACCESS';
    throw error;
  }

  // Validate input data
  const { error } = validateEditPost({ content, taggedUsersIds, links });
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  // Validate tagged users exist
  if (taggedUsersIds.length > 0) {
    const validUsersCount = await User.countDocuments({ _id: { $in: taggedUsersIds } });
    if (validUsersCount !== taggedUsersIds.length) {
      const error = new Error('One or more tagged users do not exist');
      error.statusCode = 400;
      throw error;
    }
  }
  //Handle editing Images,Video Uploaded in the Post
  //delete post uploaded files (images,videos) from Cloundinary
  for (let file of post.media) {
    if (file.publicId) {
      try {
        await deleteFileFromCloudinary(file.publicId);
      } catch (error) {
        throw error;
      }
    }
  }
  // ✅ Get Uploaded Media (images,video) In the Post
  let media = [];
  if (UploadedFiles.length !== 0) {
    media = UploadedFiles.map((file) => ({
      publicId: file.public_id,
      url: file.secure_url,
      type: file.resource_type,
    }));
  }
  // Update post
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $set: { content, taggedUsers: taggedUsersIds, links, media } },
    { new: true }
  )
    .populate('author', 'name profilePicture')
    .populate('taggedUsers', 'name profilePicture')
    .populate('sharedPost');

  return updatedPost;
};
const likePostService = async (postId, userId) => {
  // ✅ Check if the post exists
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
  // ✅ Check if the user has already liked the post
  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
      $inc: { likesCount: -1 },
    });
    return { message: 'Post unliked successfully' };
  } else {
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: userId },
      $inc: { likesCount: 1 },
    });
    return { message: 'Post liked successfully' };
  }
};

const addCommentService = async ({ postId, userId, content = null, taggedUsersIds = [] }) => {
  // Validate ObjectIds before querying the database
  // ✅ Validate ObjectIds before querying the database (keeping your function)
  if (!areValidObjectIds([postId, userId, ...taggedUsersIds])) {
    const error = new Error('Invalid ID(s) provided');
    error.statusCode = 400;
    throw error;
  }

  // Check if post exists
  const postExists = await Post.findById(postId);
  if (!postExists) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure comment is not empty
  if ((!content || content.trim() === '') && taggedUsersIds.length === 0) {
    const error = new Error('Comment cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  // Check if all tagged users exist
  if (taggedUsersIds.length > 0) {
    const validUsersCount = await User.countDocuments({ _id: { $in: taggedUsersIds } });
    if (validUsersCount !== taggedUsersIds.length) {
      const error = new Error('Tagged users not found');
      error.statusCode = 400;
      throw error;
    }
  }

  // Check if the user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Create the new comment
  const comment = await Comment.create({
    author: userId,
    post: postId,
    content,
    taggedUsers: taggedUsersIds,
  });

  // Update the post with the new comment
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
    $inc: { commentsCount: 1 },
  });

  return comment;
};

const deleteCommentService = async (commentId, userId) => {
  // ✅ Validate ObjectIds before querying the database (keeping your function)
  if (!areValidObjectIds([commentId, userId])) {
    const error = new Error('Invalid ID(s) provided');
    error.statusCode = 400;
    throw error;
  }

  // ✅ Find the comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  // ✅ Ensure User is Author or Admin
  const user = await User.findById(userId).lean();
  if (comment.author.toString() !== userId && !user?.isAdmin) {
    const error = new Error('Forbidden: You are not authorized to delete this comment');
    error.statusCode = 403; // Forbidden
    error.code = 'UNAUTHORIZED_ACCESS';
    throw error;
  }

  // ✅ Delete the comment
  await Comment.findByIdAndDelete(commentId);

  // ✅ Remove comment reference from post and decrement count
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
    $inc: { commentsCount: -1 },
  });
};

const editCommentService = async (commentId, { content, taggedUsersIds = [], userId }) => {
  // ✅ Validate IDs
  if (!areValidObjectIds([commentId, userId, ...taggedUsersIds])) {
    throw { statusCode: 400, message: 'Invalid ID(s) provided' };
  }

  // ✅ Find the comment
  const comment = await Comment.findById(commentId);
  if (!comment) throw { statusCode: 404, message: 'Comment not found' };

  // ✅ Ensure User is the Author
  if (comment.author.toString() !== userId) {
    throw { statusCode: 403, message: 'Forbidden: You cannot edit this comment' };
  }

  // ✅ Ensure Comment is not empty
  if (!content && taggedUsersIds.length === 0) {
    throw { statusCode: 400, message: 'Comment cannot be empty' };
  }

  // ✅ Validate Tagged Users Exist
  if (taggedUsersIds.length > 0) {
    const taggedUsersExist = await validateDocumentsExistence(User, taggedUsersIds);
    if (!taggedUsersExist) {
      throw { statusCode: 404, message: 'Tagged users not found' };
    }
  }

  // ✅ Update the comment
  comment.content = content;
  comment.taggedUsers = taggedUsersIds;
  await comment.save();

  return comment;
};

const getPostCommentsService = async (postId, page, limit) => {
  // ✅ Validate post ID
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    throw { statusCode: 400, message: 'Invalid post ID' };
  }

  // ✅ Check if post exists
  const postExists = await Post.findById(postId);
  if (!postExists) {
    throw { statusCode: 404, message: 'Post not found' };
  }

  // ✅ Get total comments count
  const totalComments = await Comment.countDocuments({ post: postId });

  // ✅ Fetch comments with pagination
  const comments = await Comment.find({ post: postId })
    .populate('author', 'name profilePicture')
    .populate('taggedUsers', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { totalComments, totalPages: Math.ceil(totalComments / limit), comments };
};

const getPostLikesService = async (postId, page, limit) => {
  // ✅ Validate postId
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    throw { statusCode: 400, message: 'Invalid Post ID' };
  }

  // ✅ Find the post and populate likes
  const post = await Post.findById(postId).populate({
    path: 'likes',
    select: 'name profilePicture',
    options: {
      skip: (page - 1) * limit,
      limit: limit,
    },
  });

  if (!post) {
    throw { statusCode: 404, message: 'Post not found' };
  }

  return post.likes;
};

const getPostSharesService = async (postId, page, limit) => {
  // ✅ Validate postId
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    throw { statusCode: 400, message: 'Invalid Post ID' };
  }

  // ✅ Find the post and populate shares
  const post = await Post.findById(postId).populate({
    path: 'shares',
    select: 'name profilePicture',
    options: {
      skip: (page - 1) * limit,
      limit: limit,
    },
  });

  if (!post) {
    throw { statusCode: 404, message: 'Post not found' };
  }

  return post.shares;
};

const sharePostService = async ({ userId, sharedPostId, content = '', taggedUsersIds = [] }) => {
  // ✅ Ensure Shared Post Exists
  const sharedPost = await Post.findById(sharedPostId);
  if (!sharedPost) {
    throw { statusCode: 404, message: 'Shared post not found' };
  }

  // ✅ Validate Tagged Users Exist
  if (taggedUsersIds.length !== 0) {
    if (!areValidObjectIds(taggedUsersIds) || !validateDocumentsExistence(User, taggedUsersIds)) {
      throw { statusCode: 400, message: 'Invalid or non-existent user IDs' };
    }
  }

  // ✅ Create and Save the Shared Post
  const newPost = await Post.create({
    author: userId,
    content: content,
    taggedUsers: taggedUsersIds,
    sharedPost: sharedPostId,
  });

  // ✅ Update Shared Post with New Share
  await Post.findByIdAndUpdate(sharedPostId, {
    $addToSet: { shares: userId }, // Prevents duplicate shares
    $inc: { sharesCount: 1 }, // Keeps a numeric count
  });

  return newPost;
};

/*
@param {string} PostId - The ID of the post being deleted
@param {string} userId - The ID of the user who is delete the post
*/
const deletePostService = async (postId, userId) => {
  // ✅ Validate Post ObjectId
  if (!areValidObjectIds([postId])) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
  // ✅ Validate User ObjectId
  if (!areValidObjectIds([userId])) {
    const error = new Error('User  Not found');
    error.statusCode = 404;
    throw error;
  }

  // ✅ Find the post with author populated
  const post = await Post.findById(postId).populate('author', '_id');
  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // ✅ Verify authorization (author or admin)
  const user = await User.findById(userId);
  const isAuthor = post.author._id.toString() === userId;
  const isAdmin = user?.isAdmin;

  if (!isAuthor && !isAdmin) {
    const error = new Error('Unauthorized: Only post author or admin can delete this post');
    error.statusCode = 403;
    throw error;
  }
  try {
    // TODO: Implement data backup for rollback capability
    // Currently proceeding without rollback safety

    // Delete all associated comments
    await Comment.deleteMany({ post: postId });

    // Delete media from Cloudinary if exists
    if (post.media?.length > 0) {
      for (let file of post.media) {
        if (file.publicId) {
          await deleteFileFromCloudinary(file.publicId).catch((e) => {
            console.error(`Failed to delete Cloudinary file ${file.publicId}:`, e);
            // Continue despite failure
          });
        }
      }
    }

    // Remove post references from users' savedPosts
    await UserDetails.updateMany({ savedPosts: postId }, { $pull: { savedPosts: postId } });

    // If this is a shared post, decrement sharesCount on original
    if (post.sharedPost) {
      await Post.findByIdAndUpdate(post.sharedPost, { $inc: { sharesCount: -1 } });
    }

    // Finally delete the post itself
    await Post.findByIdAndDelete(postId);

    return { message: 'Post deleted successfully' };
  } catch (error) {
    console.error('Post deletion failed:', error);

    // TODO: Implement rollback mechanism here
    // Currently errors will leave the system in partial state
    // Need to:
    // 1. Store operation state before execution
    // 2. Implement compensation actions
    // 3. Add admin alerts for manual recovery

    const serviceError = new Error('Failed to delete post');
    serviceError.statusCode = 500;
    throw serviceError;
  }
};

export {
  createPostService,
  getSinglePostService,
  editPostService,
  likePostService,
  addCommentService,
  deleteCommentService,
  editCommentService,
  getPostCommentsService,
  getPostLikesService,
  getPostSharesService,
  sharePostService,
  getFeedService,
  deletePostService,
};
