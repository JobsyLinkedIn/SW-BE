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
} from '../controllers/postsController.js';
const router = express.Router();
import uploadByMulter from "../middlewares/multer/multer.js"
import cloudinaryUploadFiles from "../middlewares/uploadToCloudinary/uploadFilesToCloudinary.js"

// api/posts
router.route('/').get(getFeedCtrl).post(uploadByMulter.array("media"),cloudinaryUploadFiles,createPostCtrl)
//We shoule Use Verify Token MiddleWare First

// api/posts/:id
router.route('/:id').get(getSinglePostCtrl).put(uploadByMulter.array("media"),cloudinaryUploadFiles,editPostCtrl);

// api/posts/postId/likes
router.route('/:postId/likes').put(likePostCtrl).get(getPostLikesCtrl); // Route to fetch users who make like to  a specific post with pagination

// /api/posts/:postId/comments
router
  .route('/:postId/comments')
  .post(addCommentCtrl) // Add a new comment to a post
  .get(getPostCommentsCtrl); // Get comments of a post
// api/posts/comment/:commentId
router
  .route('/comments/:commentId')
  .put(editCommentCtrl) // Edit a comment
  .delete(deleteCommentCtrl); // Delete a comment

// Route to fetch users who make share to  a specific post with pagination
router.route('/:postId/shares').get(getPostSharesCtrl).post(sharePostCtrl);

export default router;
