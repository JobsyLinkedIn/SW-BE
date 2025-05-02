import express from 'express';
const router = express.Router();
import authenticateUser from '../middlewares/authenticateUser.js';

import {
  replyToComment,
  toggleCommentLike,
  getCommentLikes,
  getCommentReplies,
  deleteComment,
} from '../controllers/commentsController.js';
router.post(
  '/reply',
  authenticateUser, // Your authentication middleware
  replyToComment
);

router.post('/:commentId/like', authenticateUser, toggleCommentLike);

router.get('/:commentId/likes', getCommentLikes);

router.get('/:commentId/replies', getCommentReplies);

router.delete('/:commentId', authenticateUser, deleteComment);
export default router;
