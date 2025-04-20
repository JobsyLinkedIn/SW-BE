import createCompany from "../services/company/create_company_service.js";
import updateCompany from "../services/company/update_company_service.js";
import  createJobService  from "../services/company/job_posting_service.js";
export const createCompanyController = async (req, res) => {
  try {
    const companyData = req.body;
    const createdCompany = await createCompany(companyData, req.user._id); // Passing user ID from req.user
    
    res.status(201).json({
      message: 'Company profile created successfully!',
      company: createdCompany
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating company profile.', error: err.message });
  }
};

export const updateCompanyDetails = async (req, res) => {
  try {
    const { companyId } = req.params; 
    const { logo, description, industry, location } = req.body;  

    const updatedCompany = await updateCompany(companyId, { logo, description, industry, location });

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json(updatedCompany);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const createJobController = async (req, res) => {
  try {
    const jobData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      salary: req.body.salary,
      company: req.body.companyId, 
      postedBy: req._id, 
    };

    const newJob = await createJobService(jobData);
    res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    res.status(500).json({ message: 'Error posting job', error });
  }
};

