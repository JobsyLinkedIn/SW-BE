import UserDetails from '../../models/user_details.js';
import User from '../../models/user.js';
import Company from '../../models/company.js';

const follow_target_service = async (followerEmail, targetId, targetType) => {
  try {
    const follower = await User.findOne({ email: followerEmail });
    if (!follower) {
      throw new Error('Follower user not found');
    }

    if (targetType === 'user') {
      const followedUser = await User.findById(targetId);
      if (!followedUser) throw new Error('Target user not found');

      let userDetails = await UserDetails.findOne({ user: followedUser._id });
      if (!userDetails) throw new Error('UserDetails not found for the target user');

      if (userDetails.followers.includes(follower._id)) {
        throw new Error('Already following this user');
      }

      userDetails.followers.push(follower._id);
      await userDetails.save();
      return { message: 'User followed successfully' };

    } else if (targetType === 'company') {
      const company = await Company.findById(targetId);
      if (!company) throw new Error('Target company not found');

      if (company.followers.includes(follower._id)) {
        throw new Error('Already following this company');
      }

      company.followers.push(follower._id);
      await company.save();
      return { message: 'Company followed successfully' };

    } else {
      throw new Error('Invalid target type');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export default follow_target_service;