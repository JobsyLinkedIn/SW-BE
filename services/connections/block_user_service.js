import UserDetails from '../../models/user_details.js';

export const blockUser = async (userId, targetUserId) => {
  return UserDetails.updateOne({ user: userId }, { $addToSet: { blockedUsers: targetUserId } });
};

export default blockUser;
