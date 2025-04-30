import User from '../../models/user.js';

const getUserPrivacySetting = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.connectionPrivacy;
  } catch (error) {
    throw new Error(error.message);
  }
};
export default getUserPrivacySetting;