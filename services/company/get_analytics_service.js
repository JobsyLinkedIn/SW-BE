import Job from "../../models/jobs.js";
const getCompanyJobAnalytics = async (companyId) => {
    const jobs = await Job.find({ company: companyId });
  
    const analytics = await Promise.all(
      jobs.map(async job => {
        const count = await JobApplication.countDocuments({ job: job._id });
        return {
          jobId: job._id,
          title: job.title,
          applications: count,
        };
      })
    );
  
    return analytics;
  };

export default getCompanyJobAnalytics;