import User from '../../models/user.js';
import Company from '../../models/company.js';

const remove_follower_service = async (companyId, followerId) => {
  try {
    const company = await Company.findById(companyId);
    if (!company) throw new Error('Company not found');

    const follower = await User.findById(followerId);
    if (!follower) throw new Error('Follower not found');

    if (!company.followers.includes(follower._id)) {
      throw new Error('This user is not a follower of the company');
    }

    company.followers = company.followers.filter(
      (id) => !id.equals(follower._id)
    );
    await company.save();

    follower.followingCompanies = follower.followingCompanies?.filter(
      (id) => !id.equals(company._id)
    );
    await follower.save();

    return { message: 'Follower removed from company successfully' };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default remove_follower_service;
