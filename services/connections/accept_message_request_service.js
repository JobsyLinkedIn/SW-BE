import MessageRequest from '../../models/messagesRequest.js';
import { Message } from '../../models/message.js';
import { Conversation } from '../../models/conversation.js';

const acceptMessageRequest = async (requestId, currentUserId) => {
  // Find the message request by ID
  const request = await MessageRequest.findById(requestId);
  if (!request) throw new Error('Message request not found.');

  // Check if the current user is the recipient of the message request
  if (request.to.toString() !== currentUserId.toString()) {
    throw new Error('You are not authorized to accept this request.');
  }

  // Check if a conversation already exists between the users
  let conversation = await Conversation.findOne({
    participants: { $all: [request.from, request.to] },
  });

  // If no conversation exists, create a new one
  if (!conversation) {
    conversation = new Conversation({
      participants: [request.from, request.to],
    });
    await conversation.save();
  }

  // Create the new message using the conversationId
  const newMessage = await Message.create({
    conversationId: conversation._id, // Use the conversationId
    sender: request.from,
    receiver: request.to,
    content: request.content,
  });

  // Update the conversation with the new message as the last message
  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: newMessage._id,
  });

  // If the message is unblocked, also update lastUnblockedMessage
  if (!request.isBlocked) {
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastUnblockedMessage: newMessage._id,
      lastMessage: newMessage._id,
    });
  }

  // Delete the message request after accepting it
  await MessageRequest.findByIdAndDelete(requestId);

  // Return success response with the new message and updated conversation
  return {
    message: 'Message request accepted and added to messages.',
    newMessage,
    conversation,
  };
};

export default acceptMessageRequest;
