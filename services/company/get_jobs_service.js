import Job from '../../models/jobs.js';

const getCompanyJobsService = async (companyId) => {
  const jobs = await Job.find({ company: companyId });
  return jobs;
};

export default getCompanyJobsService;
