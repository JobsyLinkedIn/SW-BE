import Company from '../../models/company.js';

const getCompanyByIdService = async (companyId) => {
  const company = await Company.findById(companyId);
  return company;
};

export default getCompanyByIdService;
