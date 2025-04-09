import User from '../../models/user.js';

export const get_pending_requests_service = async (userEmail) => {
  try {
    const user = await User.findOne({ email: userEmail }).populate('pendingRequests', 'name email');

    if (!user) {
      throw new Error('User not found');
    }

    return { pendingRequests: user.pendingRequests };
  } catch (error) {
    throw new Error(error.message);
  }
};
export default get_pending_requests_service;
