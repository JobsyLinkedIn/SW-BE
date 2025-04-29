import Company from '../models/company.js'; 

const authorizeCompanyUser = async (req, res, next) => {
  const companyId = req.params.companyId;

  try {
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    console.log("ayhaaga",company.createdBy.toString());
    console.log("ayhaaga2",req.user._id.toString());

    if (company.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to post jobs for this company' });
      }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Authorization error', error: err });
  }
};
export default  authorizeCompanyUser;