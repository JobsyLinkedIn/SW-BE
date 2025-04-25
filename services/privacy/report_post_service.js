import  {postModel as Post} from '../../models/post.js';

const allowedReasons = ['spam', 'harassment', 'inappropriate content', 'fake-account', 'other'];

const reportPost = async (reporterId, postId, reason) => {
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  if (!allowedReasons.includes(reason)) {
    const error = new Error('Invalid report reason');
    error.statusCode = 400;
    throw error;
  }

  const alreadyReported = post.reportedBy.find(
    (entry) => entry.reporterId.toString() === reporterId.toString()
  );

  if (alreadyReported) {
    const error = new Error('You already reported this post');
    error.statusCode = 409;
    throw error;
  }

  post.reportedBy.push({
    reporterId,
    reason,
    reportedAt: new Date(),
  });

  await post.save();
};

export default reportPost;
