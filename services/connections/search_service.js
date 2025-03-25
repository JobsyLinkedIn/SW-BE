import User from '../../models/user.js';
import UserDetails from '../../models/user_details.js';

export const search_user_service = async (name, company, industry) => {
  const query = {};
  const query_details = {};
  if (name) {
    query.name = new RegExp(name, 'i');
  }
  if (company) {
    query.company = new RegExp(company, 'i');
  }
  if (industry) {
    query_details.industry = new RegExp(industry, 'i');
  }
  if (query) {
    return await User.find(query);
  }
  if (query_details) {
    return await UserDetails.find(query_details);
  }
};
export default search_user_service;
