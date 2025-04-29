import Job from '../../models/jobs.js'

const createJobService = async (jobData) => {
  const newJob = new Job(jobData);
  return await newJob.save();
};
export default createJobService;
