
import Company from '../../models/company.js'; 
import User from '../../models/user.js'; 

export const getCompanyFollowersService = async (companyId) => {
  try {
    const company = await Company.findById(companyId);
    
    if (!company) {
      throw new Error('Company not found');
    }
      const followers = await User.find({ _id: { $in: company.followers } })
      .select('id name email profilePicture');
    
    
    return followers;
  } catch (error) {
    throw error;
  }
};
