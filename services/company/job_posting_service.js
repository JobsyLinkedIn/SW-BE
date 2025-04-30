import Job from '../../models/jobs.js'
import Company from '../../models/company.js';

const createJobService = async (jobData,companyid) => {
  const newJob = new Job(jobData);
  const savedJob = await newJob.save();

  // await Company.findByIdAndUpdate(
  //   jobData.company,
  //   { $push: { jobPostings: savedJob._id } }
  // );
  console.log("kalam", companyid);
  console.log("kalam", companyid);
  await Company.findByIdAndUpdate(
    companyid,
    { $push: { jobPostings: savedJob._id } },
    { new: true }
  );  
  return savedJob;
};
export default createJobService;
