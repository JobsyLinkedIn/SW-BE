import Job from '../../models/jobs.js'
import Company from '../../models/company.js';

const createJobService = async (jobData) => {
  const newJob = new Job(jobData);
  const savedJob = await newJob.save();

  await Company.findByIdAndUpdate(
    jobData.company,
    { $push: { jobPostings: savedJob._id } }
  );

  return savedJob;
};
export default createJobService;
