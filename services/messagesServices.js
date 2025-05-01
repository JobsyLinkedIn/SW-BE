import { Conversation } from '../models/conversation.js';
import { Message } from '../models/message.js';
import User from '../models/user.js';
import { areValidObjectIds } from '../utils/validateDB.js';

const getAllUserConversations = async (userId) => {
  // Validate user exists
  const userExists = areValidObjectIds([userId]) && (await User.exists({ _id: userId }));
  if (!userExists) {
    throw new Error('User not found');
  }

  // Get conversations with last message and participant details
  const conversations = await Conversation.find()
    .populate({
      path: 'participants',
      match: { _id: { $ne: userId } }, // Exclude current user
      select: 'name profilePicture',
    })
    .lean();

  // Transform data for client
  return Promise.all(
    conversations.map(async (conv) => {
      const count = await Message.countDocuments({
        conversationId: conv._id,
        isRead: false,
        receiver: userId,
      });
      return {
        ...conv,
        unreadCount: count,
      };
    })
  );
};

const getConversationHistoryService = async (userId, conversationId, page = 1, limit = 20) => {
  // Validate inputs
  if (!areValidObjectIds([userId])) {
    throw new Error('User Not Found');
  }
  if (!areValidObjectIds([conversationId])) {
    throw new Error('Conversation Not Found');
  }
  // Verify user is a conversation participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
  if (!conversation) {
    throw new Error('Conversation not found or access denied');
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Retrieve messages with pagination
  const messages = await Message.find({
    conversationId,
    $or: [
      { sender: userId }, // Messages sent by current user
      { isBlockedMessage: false }, // Non-blocked messages from others
    ],
  })
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name profilePicture')
    .lean();

  // Get total count for pagination metadata
  const totalMessages = await Message.countDocuments({ conversationId });
  // Process messages
  messages.reverse(); // Oldest first (for proper chat display)
  const unreadMessageIds = [];
  const enhancedMessages = messages.map((message) => {
    const isSentByMe = message.sender._id.toString() === userId;
    const isUnread = !message.isRead && message.receiver.toString() === userId.toString();

    if (isUnread) {
      unreadMessageIds.push(message._id);
    }

    return {
      ...message,
      sentByMe: isSentByMe,
    };
  });
  return {
    messages: enhancedMessages,
    unreadedReceivedMessageIds: unreadMessageIds,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    },
    participants: conversation.participants,
  };
};

const getUnreadCountService = async (userId) => {
  // Validate user exists
  if (!areValidObjectIds([userId])) {
    throw new Error('Invalid user ID');
  }

  // Get all conversations where user is a participant
  const conversations = await Conversation.find({
    participants: userId,
    blockedBy: { $exists: false },
  }).select('_id');

  // Get count of unread messages across all conversations
  const unreadCount = await Message.countDocuments({
    conversationId: { $in: conversations.map((c) => c._id) },
    isRead: false,
    receiver: userId,
    $or: [{ isBlockedMessage: false }, { isBlockedMessage: { $exists: false } }],
  });
  return {
    totalUnreadCount: unreadCount,
  };
};

const startConversationWithFirstMessage = async (
  senderId,
  receiverId,
  messageContent,
  media = []
) => {
  // Validate participants
  if (!areValidObjectIds([senderId, receiverId])) {
    throw new Error('Invalid participant IDs');
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  // Create new conversation if doesn't exist
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId].sort(),
    });
  }

  // Create the first message
  const message = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content: messageContent,
    media,
    isRead: false,
  });

  // Update conversation with last message
  conversation.lastMessage = message._id;
  await conversation.save();

  // Populate data for response
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name profilePicture')
    .lean();

  return {
    conversation: {
      _id: conversation._id,
      participants: conversation.participants,
      createdAt: conversation.createdAt,
    },
    message: {
      ...populatedMessage,
      sentByMe: true,
    },
  };
};

export {
  getAllUserConversations,
  getConversationHistoryService,
  getUnreadCountService,
  startConversationWithFirstMessage,
};
