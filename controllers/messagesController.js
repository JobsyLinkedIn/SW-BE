import asyncHandler from 'express-async-handler';
import {
  getAllUserConversations,
  getConversationHistoryService,
  getUnreadCountService,
  startConversationWithFirstMessage,
} from '../services/messagesServices.js';

import { uploadMediaService } from '../services/uploadFiles/uploadFileServices.js';

/**-------------------------------------------------------
 *
 * @desc    Upload Media In The message
 * @route   /api/messages/upload
 * @method   POST
 * @access   Private [Only Logged in user]
 *
 *-------------------------------------------------------*/
const uploadMediaCtrl = asyncHandler(async (req, res) => {
  const UploadedFiles = req.mediaFilesData || [];

  const uploadMediaData = uploadMediaService(UploadedFiles);

  res.status(201).json({ message: 'The files have been uploaded successfully', uploadMediaData });
});

/**-------------------------------------------------------
 *
 * @desc    Get User Conversations List
 * @route   /api/conversation/user-conversations
 * @method   GET
 * @access   Private [Only Logged in user]
 *
 *-------------------------------------------------------*/
const GetAllUserConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const conversations = await getAllUserConversations(userId);
    res.status(200).json({
      success: true,
      data: conversations,
      numberOfConversations: conversations.length,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

const getConversationHistoryCtrl = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await getConversationHistoryService(
      req.user._id,
      conversationId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message,
    });
  }
};

const getUnreadMessagesCountCtrl = asyncHandler(async (req, res) => {
  try {
    const result = await getUnreadCountService(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

// Controller
const startNewConversationCtrl = asyncHandler(async (req, res) => {
  try {
    const { receiverId, content, media } = req.body;
    const result = await startConversationWithFirstMessage(
      req.user._id,
      receiverId,
      content,
      media
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

export {
  uploadMediaCtrl,
  GetAllUserConversation,
  getConversationHistoryCtrl,
  getUnreadMessagesCountCtrl,
  startNewConversationCtrl,
};
