import Company from '../../models/company.js'
import User from '../../models/user.js';
export const createCompany = async (companyData, userId) => {
  const { name, industry, location, logo, description } = companyData;

  if (!name || !industry || !location) {
    throw new Error('Please provide all required fields: name, industry, location.');
  }

  try {
    const newCompany = new Company({
      name,
      industry,
      location,
      logo,
      description,
      createdBy: userId, 
    });

    await newCompany.save();

    await User.findByIdAndUpdate(userId, {
      $push: { companyOwned: newCompany._id },
    });

    return newCompany;
  } catch (err) {
    throw new Error('Error saving company to database.');
  }
};
export default createCompany;

