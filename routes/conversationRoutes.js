import express from 'express';
import authenticateUser from '../middlewares/authenticateUser.js';

import {
  GetAllUserConversation,
  getConversationHistoryCtrl,
  startNewConversationCtrl,
} from '../controllers/messagesController.js';
const router = express.Router();

// GET /api/conversation/user-conversations
router.route('/user-conversations').get(authenticateUser, GetAllUserConversation);

//GET /api/conversation/user-conversations
router.get('/:conversationId', authenticateUser, getConversationHistoryCtrl);

//POST /api/conversation/start
router.post('/start', authenticateUser, startNewConversationCtrl);

export default router;
