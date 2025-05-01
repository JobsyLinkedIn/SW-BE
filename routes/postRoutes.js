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
  searchPostsCtrl,
  uploadMediaCtrl,
  getCurrentUserPosts,
  getUserPostsByIdCtrl
} from '../controllers/postsController.js';
const router = express.Router();
import uploadByMulter from '../middlewares/multer/multer.js';
import authenticateUser from '../middlewares/authenticateUser.js';
import cloudinaryUploadFiles from '../middlewares/uploadToCloudinary/uploadFilesToCloudinary.js';
import { checkBlocked } from '../middlewares/checkBlocked.js';

// api/posts
router
  .route('/')
  .get(authenticateUser, getFeedCtrl)
  .post(authenticateUser, uploadByMulter.array('media'), cloudinaryUploadFiles, createPostCtrl);
// Search posts by keyword
router.get('/search', authenticateUser, searchPostsCtrl);

// GET /api//my-posts
router.get('/my-posts',authenticateUser,getCurrentUserPosts)

// GET /api/posts/user-posts/:userId
router.get(
  '/user-posts/:userId',
  authenticateUser,
  checkBlocked,
  getUserPostsByIdCtrl
);

// POST /api/posts/upload
router
  .route('/upload')
  .post(authenticateUser, uploadByMulter.array('media'), cloudinaryUploadFiles, uploadMediaCtrl);
// api/posts/:postId
router
  .route('/:postId')
  .get(authenticateUser, checkBlocked, getSinglePostCtrl)
  .put(authenticateUser, uploadByMulter.array('media'), cloudinaryUploadFiles, editPostCtrl)
  .delete(authenticateUser, deletePostCtrl);

// api/posts/postId/likes
router
  .route('/:postId/likes')
  .put(authenticateUser, checkBlocked, likePostCtrl)
  .get(getPostLikesCtrl); // Route to fetch users who make like to  a specific post with pagination

// /api/posts/:postId/comments
router
  .route('/:postId/comments')
  .post(authenticateUser, checkBlocked, addCommentCtrl) // Add a new comment to a post
  .get(getPostCommentsCtrl); // Get comments of a post
// api/posts/comment/:commentId
router
  .route('/comments/:commentId')
  .put(authenticateUser, editCommentCtrl) // Edit a comment
  .delete(authenticateUser, deleteCommentCtrl); // Delete a comment

// Route to fetch users who make share to  a specific post with pagination
router.route('/:postId/shares').get(getPostSharesCtrl).post(authenticateUser, sharePostCtrl);

export default router;
