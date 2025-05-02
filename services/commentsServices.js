import { validateDocumentsExistence, areValidObjectIds } from '../utils/validateDB.js';
import { commentModel as Comment } from '../models/comments.js';
import User from '../models/user.js';
import Profile from '../models/profileModel.js';
import { postModel as Post, validateCreatePost, validateEditPost } from '../models/post.js';

const replyToCommentService = async ({
  content = null,
  taggedUsersIds = [],
  parentCommentId,
  userId,
}) => {
  if (!parentCommentId) {
    const error = new Error('Parent comment Id Is Required');
    error.statusCode = 404;
    throw error;
  }
  // Validate ObjectIds
  const idsToValidate = [parentCommentId, userId, ...taggedUsersIds];
  if (!areValidObjectIds(idsToValidate)) {
    const error = new Error('Invalid ID(s) provided');
    error.statusCode = 400;
    throw error;
  }

  // Check if parent comment exists
  const parentComment = await Comment.findById(parentCommentId).populate('post');
  if (!parentComment) {
    const error = new Error('Parent comment not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Get user profile
  const userProfile = await Profile.findOne({ userId }).select('_id').lean();
  const refProfile = userProfile?._id || null;

  // Create the reply
  const reply = await Comment.create({
    author: userId,
    post: parentComment.post, // Inherit post from parent
    content,
    taggedUsers: taggedUsersIds,
    refProfile,
  });

  // Add the reply to parent comment
  await Comment.findByIdAndUpdate(parentCommentId, {
    $push: { replies: reply._id },
  });

  // Increment the post's comments count
  await Post.findByIdAndUpdate(parentComment.post, {
    $inc: { commentsCount: 1 },
  });

  return reply;
};

const likeCommentService = async (commentId, userId) => {
  // ✅ Check if the comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  // ✅ Check if the user has already liked the comment
  const hasLiked = comment.likes.some((like) => like.toString() === userId.toString());

  if (hasLiked) {
    // Unlike the comment
    await Comment.findByIdAndUpdate(commentId, {
      $pull: { likes: userId },
      $inc: { likesCount: -1 },
    });
    return {
      message: 'Comment unliked successfully',
      action: 'unliked',
      likesCount: comment.likesCount - 1,
      isLiked: false,
    };
  } else {
    // Like the comment
    await Comment.findByIdAndUpdate(commentId, {
      $addToSet: { likes: userId },
      $inc: { likesCount: 1 },
    });
    return {
      message: 'Comment liked successfully',
      action: 'liked',
      likesCount: comment.likesCount + 1,
      isLiked: true,
    };
  }
};

const getCommentLikesService = async (commentId, page = 1, limit = 10) => {
  // ✅ 1. Validate commentId
  if (!commentId || !areValidObjectIds([commentId])) {
    throw { statusCode: 400, message: 'Invalid Comment ID' };
  }

  // ✅ 2. Fetch comment with paginated likes (user IDs only)
  const comment = await Comment.findById(commentId)
    .select('likes likesCount')
    .slice('likes', [(page - 1) * limit, limit]); // Pagination

  if (!comment) {
    throw { statusCode: 404, message: 'Comment not found' };
  }

  // ✅ 3. Aggregate: Join User + Profile, then filter by users who liked the comment
  const likesWithProfiles = await User.aggregate([
    // Match users who liked the comment (from comment.likes)
    { $match: { _id: { $in: comment.likes } } },

    // Join with Profile collection
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'profile',
      },
    },

    // Unwind the profile array
    { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },

    // Project only the fields we need
    {
      $project: {
        _id: 1,
        userName: '$name',
        name: { $ifNull: ['$profile.name', '$name'] }, // Use profile.name if exists, else user.name
        profilePicture: '$profile.profilePicture',
        // Add other fields if needed (e.g., email, bio)
      },
    },
  ]);

  return {
    likes: likesWithProfiles,
    currentPage: page,
    totalPages: Math.ceil(comment.likesCount / limit),
    totalLikesCount: comment.likesCount,
  };
};

const getCommentRepliesService = async (parentCommentId, userId = null) => {
  if (!areValidObjectIds([parentCommentId])) {
    throw new Error('Invalid comment ID');
  }

  // Get the parent comment to verify it exists
  const parentComment = await Comment.findById(parentCommentId);
  if (!parentComment) {
    throw new Error('Parent comment not found');
  }

  // Get all replies for this comment
  const replies = await Comment.find({
    _id: { $in: parentComment.replies },
  })
    .populate('author', 'username profilePicture')
    .populate('refProfile', 'displayName')
    .populate('taggedUsers', 'username')
    .sort({ createdAt: 1 }) // Oldest first (common for replies)
    .lean();

  // Add isLiked status if user is authenticated
  if (userId) {
    await Promise.all(
      replies.map(async (reply) => {
        reply.isLiked = await isLikedService(userId, reply._id, 'Comment');
      })
    );
  }

  return replies;
};

const deleteCommentService = async (commentId, userId) => {
  // Validate IDs
  if (!areValidObjectIds([commentId, userId])) {
    throw { statusCode: 400, message: 'Invalid IDs provided' };
  }

  // Find the comment with post author populated
  const comment = await Comment.findById(commentId).populate({
    path: 'post',
    select: 'author',
    populate: {
      path: 'author',
      select: '_id',
    },
  });

  if (!comment) {
    throw { statusCode: 404, message: 'Comment not found' };
  }

  // Check permissions
  const user = await User.findById(userId);
  const isCommentAuthor = comment.author.toString() === userId.toString();
  const isPostAuthor = comment.post?.author?._id.toString() === userId.toString();
  const isAdmin = user?.isAdmin;

  if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
    throw {
      statusCode: 403,
      message: 'Unauthorized: Only comment author, post author or admin can delete this comment',
    };
  }

  // Get all nested reply IDs (including the main comment)
  const getAllReplyIds = async (commentId) => {
    const replyIds = [commentId];
    const comment = await Comment.findById(commentId).select('replies');

    if (comment?.replies?.length > 0) {
      for (const replyId of comment.replies) {
        const nestedReplies = await getAllReplyIds(replyId);
        replyIds.push(...nestedReplies);
      }
    }
    return replyIds;
  };

  // Get all IDs to delete (recursively)
  const allCommentIds = await getAllReplyIds(commentId);

  // Delete all comments in bulk
  await Comment.deleteMany({ _id: { $in: allCommentIds } });

  // Update post's comment count (using the count of deleted comments)
  await Post.findByIdAndUpdate(comment.post, {
    $inc: { commentsCount: -allCommentIds.length },
    $pull: { comments: commentId }, // Remove main comment from post's array
  });

  // Remove from any parent comment's replies array
  await Comment.updateMany({ replies: commentId }, { $pull: { replies: commentId } });

  return {
    success: true,
    message: `Deleted comment and ${allCommentIds.length - 1} replies`,
    deletedCount: allCommentIds.length,
  };
};

export {
  replyToCommentService,
  likeCommentService,
  getCommentLikesService,
  getCommentRepliesService,
  deleteCommentService,
};
