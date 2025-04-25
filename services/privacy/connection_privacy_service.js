import User from '../../models/user.js';

const sendConnectionRequest = async (senderId, targetId) => {
  const sender = await User.findById(senderId);
  const target = await User.findById(targetId);

  if (!sender || !target) {
    throw new Error('User not found');
  }

  const setting = target.connectionPrivacy;

  if (setting === 'no-one') return false;

  if (setting === 'everyone') {
    // Already sent?
    if (target.pendingRequests.includes(senderId)) {
      const error = new Error('Connection request already sent');
      error.statusCode = 409;
      throw error;
    }
    
    if (target.connections.includes(senderId)) {
      const error = new Error('Already connected');
      error.statusCode = 400; // Bad Request
      throw error;
    }
    

    // Already connected?
    if (target.connections.includes(senderId)) {
      throw new Error('Already connected');
    }

    // Append the sender to target's pending requests
    target.pendingRequests.push(senderId);
    await target.save();

    return true;
  }

  return false;
};

export default sendConnectionRequest;
