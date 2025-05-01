import UserDetails from '../models/user_details.js';
import {postModel as Post} from '../models/post.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

const checkBlocked = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { postId } = req.params || req.body;
    const { userId: targetUserId } = req.params || req.body;

    // Validate we have either postId or targetUserId
    if (!postId && !targetUserId) {
      return res.status(400).json({ message: 'Must provide either postId or userId' });
    }

    // Validate ID formats
    if (targetUserId && !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    if (postId && !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    let finalTargetUserId = targetUserId;

    // If checking via post, get the post's author
    if (postId) {
      const post = await Post.findById(postId).select('author');
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      finalTargetUserId = post.author.toString();
    }

    // Skip check if user is accessing their own content
    if (finalTargetUserId === currentUserId.toString()) {
      return next();
    }

    // Check if current user is blocked by the target user
    const targetUserDetails = await UserDetails.findOne({ 
      user: finalTargetUserId 
    }).select('blockedUsers');

    const isBlocked = targetUserDetails?.blockedUsers?.some(
      blockedId => blockedId.toString() === currentUserId.toString()
    );

    if (isBlocked) {
      const errorMessage = postId 
        ? 'You cannot access this post because you are blocked by the author' 
        : 'You cannot access this user because you are blocked';
      return res.status(403).json({ message: errorMessage });
    }

    next();
  } catch (err) {
    console.error('Block check error:', err);
    return res.status(500).json({ message: 'Internal server error while checking block status' });
  }
};

export { checkBlocked };
