import MessageRequest from '../../models/messagesRequest.js';
import checkConnection from './check_connection_service.js';

export const createMessageRequest = async (from, to, content) => {
  if (from === to) {
    throw new Error('You cannot send a message request to yourself.');
  }

  // Check if users are already connected
  const connectionExists = await checkConnection(from, to);
  if (connectionExists) {
    throw new Error('You are already connected with this user.');
  }

  // Create the message request
  const newRequest = await MessageRequest.create({ from, to, content });
  return newRequest;
};

export default createMessageRequest;
