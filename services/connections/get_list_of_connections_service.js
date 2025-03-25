import User from '../../models/user.js';

export const get_connections_service = async (userEmail) => {
  try {
    const user = await User.findOne({ email: userEmail }).populate('connections', 'name email profilePicture');

    if (!user) {
      throw new Error('User not found');
    }

    return { connections: user.connections };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default get_connections_service;