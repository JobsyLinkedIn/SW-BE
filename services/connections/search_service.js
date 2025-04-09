import User from '../../models/user.js';
import UserDetails from '../../models/user_details.js';
import Company from '../../models/company.js';

export const search_user_service = async (name, companyName, industry) => {
  let query = [];

  if (name) {
    query.push({ name: new RegExp(name, 'i') });
  }

  if (companyName) {
    const company = await Company.findOne({ name: new RegExp(companyName, 'i') });

    if (company) {
      query.push({ _id: { $in: company.followers } });
    } else {
      return [];
    }
  }

  if (industry) {
    const userDetails = await UserDetails.find({ industry: new RegExp(industry, 'i') });
    const userIds = userDetails.map((detail) => detail.user);

    if (userIds.length > 0) {
      query.push({ _id: { $in: userIds } });
    }
  }

  return await User.find({ $or: query });
};

export default search_user_service;
