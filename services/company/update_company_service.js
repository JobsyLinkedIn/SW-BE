import Company from "../../models/company.js";
export const updateCompany = async (companyId, updatedData) => {
  try {
    const company = await Company.findByIdAndUpdate(companyId, updatedData, { new: true });
    return company;
  } catch (err) {
    console.error('Error updating company:', err);
    throw new Error('Error updating company');
  }
};
export default updateCompany;
