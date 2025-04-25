import User from '../../models/user.js';
import UserDetails from '../../models/user_details.js';
import Company from '../../models/company.js';

const unfollow_target_service = async (followerEmail, targetId, targetType) => {
  try {
    const follower = await User.findOne({ email: followerEmail });
    if (!follower) {
      throw new Error('Follower user not found');
    }

    if (targetType === 'user') {
      const followed = await User.findById(targetId);
      if (!followed) throw new Error('Followed user not found');

      const followedDetails = await UserDetails.findOne({ user: followed._id });
      if (!followedDetails) throw new Error('User details not found for the followed user');

      if (!followedDetails.followers.includes(follower._id)) {
        throw new Error('You are not following this user');
      }

      followedDetails.followers = followedDetails.followers.filter(
        (id) => !id.equals(follower._id)
      );
      await followedDetails.save();
    } else if (targetType === 'company') {
      const company = await Company.findById(targetId);
      if (!company) throw new Error('Company not found');

      if (!company.followers?.includes(follower._id)) {
        throw new Error('You are not following this company');
      }

      company.followers = company.followers.filter((id) => !id.equals(follower._id));
      await company.save();
    } else {
      throw new Error('Invalid targetType');
    }

    return { message: `${targetType} unfollowed successfully` };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default unfollow_target_service;
