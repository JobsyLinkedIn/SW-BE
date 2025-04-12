import UserDetails from '../../models/user_details.js';

export const unblockUser = async (userId, targetUserId) => {
  return UserDetails.updateOne({ user: userId }, { $pull: { blockedUsers: targetUserId } });
};
export default unblockUser;
