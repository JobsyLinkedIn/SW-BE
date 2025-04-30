import express from 'express';
import {
  createPostCtrl,
  getFeedCtrl,
  getSinglePostCtrl,
  editPostCtrl,
  likePostCtrl,
  addCommentCtrl,
  deleteCommentCtrl,
  editCommentCtrl,
  getPostCommentsCtrl,
  getPostLikesCtrl,
  getPostSharesCtrl,
  sharePostCtrl,
  deletePostCtrl,
} from '../controllers/postsController.js';
const router = express.Router();
import uploadByMulter from '../middlewares/multer/multer.js';
import authenticateUser from '../middlewares/authenticateUser.js';
import cloudinaryUploadFiles from '../middlewares/uploadToCloudinary/uploadFilesToCloudinary.js';

// api/posts
router
  .route('/')
  .get(authenticateUser, getFeedCtrl)
  .post(authenticateUser, uploadByMulter.array('media'), cloudinaryUploadFiles, createPostCtrl);
//We shoule Use Verify Token MiddleWare First

// api/posts/:id
router
  .route('/:id')
  .get(getSinglePostCtrl)
  .put(authenticateUser, uploadByMulter.array('media'), cloudinaryUploadFiles, editPostCtrl)
  .delete(authenticateUser, deletePostCtrl);

// api/posts/postId/likes
router.route('/:postId/likes').put(authenticateUser, likePostCtrl).get(getPostLikesCtrl); // Route to fetch users who make like to  a specific post with pagination

// /api/posts/:postId/comments
router
  .route('/:postId/comments')
  .post(authenticateUser, addCommentCtrl) // Add a new comment to a post
  .get(getPostCommentsCtrl); // Get comments of a post
// api/posts/comment/:commentId
router
  .route('/comments/:commentId')
  .put(authenticateUser, editCommentCtrl) // Edit a comment
  .delete(authenticateUser, deleteCommentCtrl); // Delete a comment

// Route to fetch users who make share to  a specific post with pagination
router.route('/:postId/shares').get(getPostSharesCtrl).post(authenticateUser, sharePostCtrl);

export default router;
