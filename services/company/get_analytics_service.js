import Job from "../../models/jobs.js";
import JobApplication from "../../models/job_application.js";
import Company from "../../models/company.js";
import  {postModel as Post} from '../../models/post.js';

const getCompanyJobAnalytics = async (companyId) => {
  const company = await Company.findById(companyId).populate('jobPostings followers');

  if (!company) throw new Error('Company not found');

  // Total job postings
  const totalJobs = company.jobPostings.length;

  // Followers count
  const totalFollowers = company.followers.length;

  // Applications count for all jobs
  const totalApplications = await JobApplication.countDocuments({ job: { $in: company.jobPostings } });

  // Announcements count
  const totalAnnouncements = await Post.countDocuments({ author: companyId });

  return {
    totalFollowers,
    totalJobs,
    totalApplications,
    totalAnnouncements
  };
};

export default getCompanyJobAnalytics;
