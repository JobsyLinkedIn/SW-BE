import {
  replyToCommentService,
  likeCommentService,
  getCommentLikesService,
  getCommentRepliesService,
  deleteCommentService,
} from '../services/commentsServices.js';
const replyToComment = async (req, res, next) => {
  try {
    const { content = '', taggedUsersIds = [], parentCommentId } = req.body;
    const userId = req.user._id; // From authentication middleware

    const reply = await replyToCommentService({
      content,
      taggedUsersIds,
      parentCommentId,
      userId,
    });

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
};

const toggleCommentLike = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const result = await likeCommentService(commentId, userId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getCommentLikes = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getCommentLikesService(commentId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCommentReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const replies = await getCommentRepliesService(commentId);

    res.status(200).json({
      success: true,
      replies,
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id; // From auth middleware

    const result = await deleteCommentService(commentId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
export { replyToComment, toggleCommentLike, getCommentLikes, getCommentReplies, deleteComment };
