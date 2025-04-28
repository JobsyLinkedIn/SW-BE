import User from '../../models/user.js';

const updateConnectionPrivacy = async (userId, newSetting) => {
  const validSettings = ['no-one', 'everyone'];
  if (!validSettings.includes(newSetting)) {
    const error = new Error('Invalid privacy setting');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.connectionPrivacy = newSetting;
  await user.save();

  return user;
};

export default  updateConnectionPrivacy;