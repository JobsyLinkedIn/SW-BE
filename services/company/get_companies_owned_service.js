import User from '../../models/user.js';

export const getCompaniesOwnedByUser = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: 'companyOwned',
      select: '_id name industry logo',
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.companyOwned; 
  } catch (err) {
    throw new Error('Error fetching companies owned by user');
  }
};

export default getCompaniesOwnedByUser;
