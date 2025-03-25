import User from '../../models/user.js';

export const remove_connection_service = async (senderEmail, receiverEmail) => {
  try {
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      throw new Error('One or both users not found');
    }

    if (!sender.connections.includes(receiver._id)) {
      throw new Error('Users are not connected');
    }
    sender.connections = sender.connections.filter(id => !id.equals(receiver._id));
    receiver.connections = receiver.connections.filter(id => !id.equals(sender._id));

    await sender.save();
    await receiver.save();

    return { message: 'Connection removed successfully' };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default remove_connection_service;
