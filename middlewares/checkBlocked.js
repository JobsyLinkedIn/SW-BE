import UserDetails from '../models/user_details.js';
import Post from '../models/post.js';
import mongoose from 'mongoose';

const checkBlocked = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId || req.body.postId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(postId).select('author');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const postAuthorId = post.author.toString();

    // Only check if the author has blocked the current user
    const authorDetails = await UserDetails.findOne({ user: postAuthorId }).select('blockedUsers');

    const isBlocked = authorDetails?.blockedUsers.includes(userId);

    if (isBlocked) {
      return res.status(403).json({ message: 'You are blocked by this user' });
    }

    next();
  } catch (err) {
    console.error('Block check error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { checkBlocked };
