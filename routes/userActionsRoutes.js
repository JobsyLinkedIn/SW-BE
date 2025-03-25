import express from 'express';
import {
  savePostCtrl,
  unsavePostCtrl,
  getSavedPostsCtrl,
} from '../controllers/userActionsController.js';
const router = express.Router();

// api/user/actions/save-post/:postId
router.route('/save-post/:postId').put(savePostCtrl).delete(unsavePostCtrl);
// api/user/actions/saved-posts
router.get('/saved-posts', getSavedPostsCtrl);

export default router;
