import User from '../../models/user.js';

export const accept_decline_connection_service = async (receiverEmail, senderEmail, action) => {
  try {
    const receiver = await User.findOne({ email: receiverEmail });
    const sender = await User.findOne({ email: senderEmail });

    if (!receiver || !sender) {
      throw new Error('One or both users not found');
    }

    if (!receiver.pendingRequests.includes(sender._id)) {
      throw new Error('No pending request from this user');
    }

    if (action === 'accept') {
      receiver.pendingRequests = receiver.pendingRequests.filter((id) => !id.equals(sender._id));
      receiver.connections.push(sender._id);
      sender.connections.push(receiver._id);
      await sender.save();
    } else if (action === 'decline') {
      receiver.pendingRequests = receiver.pendingRequests.filter((id) => !id.equals(sender._id));
    } else {
      throw new Error('Invalid action. Use "accept" or "decline".');
    }

    await receiver.save();

    return { message: `Connection request ${action}ed successfully` };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default accept_decline_connection_service;
