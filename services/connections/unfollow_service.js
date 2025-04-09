import UserDetails from '../../models/user_details.js';
import User from '../../models/user.js';
export const unfollow_user_service = async (followerEmail, followedEmail) => {
  try {
    const follower = await User.findOne({ email: followerEmail });
    const followed = await User.findOne({ email: followedEmail });

    if (!follower || !followed) {
      throw new Error('One or both users not found');
    }

    let followedDetails = await UserDetails.findOne({ user: followed._id });
    if (!followedDetails) {
      throw new Error('User details not found for the followed user');
    }

    if (!followedDetails.followers.includes(follower._id)) {
      throw new Error('You are not following this user');
    }

    // Remove follower
    followedDetails.followers = followedDetails.followers.filter((id) => !id.equals(follower._id));
    await followedDetails.save();

    return { message: 'User unfollowed successfully' };
  } catch (error) {
    throw new Error(error.message);
  }
};
export default unfollow_user_service;
