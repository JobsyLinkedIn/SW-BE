import Company from '../../models/company.js';

const getCompanyFollowersCountService = async (companyId) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new Error('Company not found');
  }

  return company.followers.length;
};

export default getCompanyFollowersCountService;
