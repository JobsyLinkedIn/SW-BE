import User from '../../models/user.js';

const checkConnection = async (from, to) => {
  const sender = await User.findById(from);
  const receiver = await User.findById(to);

  if (!sender || !receiver) {
    return false;
  }

  // Ensure sender.connections is an array before checking
  if (Array.isArray(sender.connections) && sender.connections.includes(to)) {
    return true; // Sender is connected to receiver
  }

  // Ensure receiver.connections is an array before checking
  if (Array.isArray(receiver.connections) && receiver.connections.includes(from)) {
    return true; // Receiver is connected to sender
  }

  // If neither is connected, return false
  return false;
};

export default checkConnection;
