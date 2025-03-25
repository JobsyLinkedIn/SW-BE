import User from '../../models/user.js';

export const send_connection_request_service = async (senderEmail, receiverEmail) => {
  try {
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });
    // console.log("Sender:", sender);  
    // console.log("Receiver:", receiver);  
    if (!sender || !receiver) {
      throw new Error('One or both users not found');
    }

    if (sender.connections.includes(receiver._id)) {
      throw new Error('You are already connected');
    }

    if (receiver.pendingRequests.includes(sender._id)) {
      throw new Error('Connection request already sent');
    }

    receiver.pendingRequests.push(sender._id);
    await receiver.save();

    return { message: 'Connection request sent successfully' };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default send_connection_request_service;

