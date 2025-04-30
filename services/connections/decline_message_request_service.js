import MessageRequest from '../../models/messagesRequest.js';

const declineMessageRequest = async (requestId, currentUserId) => {
  // Find the message request by ID
  const request = await MessageRequest.findById(requestId);
  if (!request) throw new Error('Message request not found.');

  // Check if the current user is the recipient of the message request
  if (request.to.toString() !== currentUserId.toString()) {
    throw new Error('You are not authorized to decline this request.');
  }

  // Remove the message request from the database
  await MessageRequest.findByIdAndDelete(requestId);

  // Return success response
  return {
    message: 'Message request declined successfully.',
  };
};

export default declineMessageRequest;
