import Company from "../../models/company.js";
const checkIfUserFollowsCompany = async (companyId, userId) => {
  const company = await Company.findById(companyId).select('followers');
  if (!company) {
    throw new Error('CompanyNotFound');
  }

  return company.followers.includes(userId);
};
export default checkIfUserFollowsCompany;
