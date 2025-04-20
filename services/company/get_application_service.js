import JobApplication from "../../models/job_application.js";
const getCompanyJobApplications = async (companyId) => {
    return await JobApplication.find()
      .populate({
        path: 'job',
        match: { company: companyId },
      })
      .populate('applicant', 'name email resume')
      .then(apps => apps.filter(app => app.job !== null));
  };
export default getCompanyJobApplications;