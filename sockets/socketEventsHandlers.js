import { Message } from '../models/message.js';
import { Conversation } from '../models/conversation.js';
import { Socket } from 'socket.io';
import { areValidObjectIds } from '../utils/validateDB.js';
import { wasTheUserBlocked } from '../utils/wasTheUseBlocked.js';
const handleJoinConversation = async (socket, conversationId) => {
  try {
    //Check ObjectID Of Mongo
    if (!areValidObjectIds([conversationId])) {
      throw new Error('Conversation not found');
    }
    // Verify The conversation Is Exist:
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.error('Conversation not found');
      throw new Error('Conversation not found');
    }
    // Verify user has access to this conversation:
    if (!conversation.participants.includes(socket.request.user.userId)) {
      throw new Error('Unauthorized conversation access');
    }
    socket.join(conversationId);
    console.log(
      `User with Id:  ${socket.request.user.userId} joined conversation : ${conversationId}`
    );
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
};

const handleleaveConversation = (socket, conversationId) => {
  socket.leave(conversationId);
  console.log(`User ${socket.request.user.userId} left conversation ${conversationId}`);
};

const handleSendMessage = async (socket, io, messageData) => {
  try {
    const { conversationId, receiverId, content = '', media = null } = messageData;

    const senderId = socket.request.user.userId;
    const isBlockedMessage = await wasTheUserBlocked(receiverId, senderId);
    const message = await Message.create({
      conversationId: conversationId,
      sender: senderId,
      receiver: receiverId,
      content,
      media,
      isBlockedMessage: isBlockedMessage,
    });
    const conversation = await Conversation.findByIdAndUpdate(messageData.conversationId, {
      lastMessage: message._id,
    });
    if (!isBlockedMessage) {
      conversation.lastUnblockedMessage = message;
      conversation.save();
      // Emit to all participants in the conversation
      io.to(messageData.conversationId).emit('newMessage', message);
      //Send a notification to a user to inform him that he has received a new message
      // Emit to receiver for unseen count update
      io.to(receiverId).emit('newUnseenMessage', message.conversationId);
    } else {
      io.to(senderId).emit('newMessage', message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleTypingStatus = async (
  socket,
  io,
  conversationsTypingStatus,
  { conversationId, isTyping }
) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    const receiverID = conversation.participants.find(
      (participantId) => participantId.toString() !== socket.request.user.userId.toString()
    );
    const isBlockedUser = await wasTheUserBlocked(receiverID, socket.request.user.userId);
    if (isBlockedUser) {
      return;
    }
    // Initialize if needed
    if (!conversationsTypingStatus[conversationId]) {
      conversationsTypingStatus[conversationId] = {};
    }

    // Update status
    conversationsTypingStatus[conversationId][socket.request.user.userId] = isTyping;
    // Notify participants
    io.to(conversationId).emit('typing', {
      userId: socket.request.user.userId,
      isTyping,
      conversationId,
    });
    // Auto-clear after timeout
    if (isTyping) {
      setTimeout(() => {
        if (conversationsTypingStatus[conversationId]?.[socket.request.user.userId]) {
          conversationsTypingStatus[conversationId][socket.request.user.userId] = false;
          io.to(conversationId).emit('typing', {
            userId: socket.request.user.userId,
            isTyping: false,
            conversationId,
          });
        }
      }, 9000);
    }
  } catch (error) {
    console.error(error);
  }
};

const handleMarkAsRead = async (socket, io, messageIds) => {
  try {
    // Validate at least one message exists
    if (!messageIds?.length) {
      throw new Error('No message IDs provided');
    }

    // Get messages and verify ownership
    const messages = await Message.find({
      _id: { $in: messageIds },
      receiver: socket.request.user.userId,
    });

    if (messages.length === 0) {
      throw new Error('No valid messages found');
    }

    // Update messages as read
    await Message.updateMany({ _id: { $in: messageIds } }, { $set: { isRead: true } });

    // Get updated messages with population
    const updatedMessages = await Message.find({
      _id: { $in: messageIds },
    });

    // Notify senders
    updatedMessages.forEach((message) => {
      io.to(message.sender._id.toString()).emit('messagesRead', {
        messageId: message._id,
        conversationId: message.conversationId,
      });
    });

    // Send confirmation to requester
    socket.emit('markReadSuccess', {
      messageIds,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    socket.emit('markReadError', {
      error: error.message,
      messageIds,
    });
  }
};

export {
  handleJoinConversation,
  handleleaveConversation,
  handleSendMessage,
  handleTypingStatus,
  handleMarkAsRead,
};
