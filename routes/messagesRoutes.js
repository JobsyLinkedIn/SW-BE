import express from 'express';
import uploadByMulter from '../middlewares/multer/multer.js';
import authenticateUser from '../middlewares/authenticateUser.js';
import cloudinaryUploadFiles from '../middlewares/uploadToCloudinary/uploadFilesToCloudinary.js';

import {
  uploadMediaCtrl,
  GetAllUserConversation,
  getConversationHistoryCtrl,
  getUnreadMessagesCountCtrl,
} from '../controllers/messagesController.js';
const router = express.Router();

// POST /api/messages/upload
router
  .route('/upload')
  .post(authenticateUser, uploadByMulter.array('media'), cloudinaryUploadFiles, uploadMediaCtrl);

//GET /api/messages/unread-count
router.route('/unread-count').get(authenticateUser, getUnreadMessagesCountCtrl);

export default router;
