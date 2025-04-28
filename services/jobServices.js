import Job from '../models/jobs.js';
import User from '../models/user.js';
import Company from '../models/company.js';

export const createJobService = async (jobData, userId) => {
  let company = await Company.findOne({ createdBy: userId });
  if (!company) {
    company = { _id: null };
  }
  const job = new Job({
    ...jobData,
    company: company._id,
    postedBy: userId,
  });
  await job.save();
  company.jobPostings.push(job._id);
  await company.save();

  return job;
};

export const filterJobsService = async (filters, page = 1, limit = 10) => {
  const query = {};

  if (filters.location) query.location = new RegExp(filters.location, 'i');
  if (filters.industry) query.industry = new RegExp(filters.industry, 'i');
  if (filters.salaryRange) {
    const [minSalary, maxSalary] = filters.salaryRange.split('-').map(Number);
    query.salary = { $gte: minSalary, $lte: maxSalary };
  }
  if (filters.jobType) query.jobType = new RegExp(filters.jobType, 'i');
  if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
  if (filters.companyName) {
    const company = await Company.findOne({ name: new RegExp(filters.companyName, 'i') });
    if (company) {
      query.company = company._id;
    } else {
      return { jobs: [], totalJobs: 0, totalPages: 0 };
    }
  }

  const jobs = await Job.find(query)
    .select('-applications') 
    .populate('company', 'name')
    .skip((page - 1) * limit)
    .limit(limit);

  const totalJobs = await Job.countDocuments(query);

  return { jobs, totalJobs, totalPages: Math.ceil(totalJobs / limit) };
};

export const searchJobsService = async (keyword, location, industry, page = 1, limit = 10) => {
  const query = {};

  if (keyword) query.title = new RegExp(keyword, 'i');
  if (location) query.location = new RegExp(location, 'i');
  if (industry) query.industry = new RegExp(industry, 'i');

  const jobs = await Job.find(query)
    .select('-applications') 
    .populate('company', 'name')
    .skip((page - 1) * limit)
    .limit(limit);

  const totalJobs = await Job.countDocuments(query);

  return { jobs, totalJobs, totalPages: Math.ceil(totalJobs / limit) };
};


export const applyForJobService = async (req) => {
  const userId = req.user._id;
  const { jobId } = req.params;

  const job = await Job.findById(jobId).select('-applications'); 
  if (!job) throw new Error('Job not found');

  const alreadyApplied = job.applications.some(
    (application) => application.applicant.toString() === userId
  );

  if (alreadyApplied) throw new Error('You have already applied for this job');

  const resume = req.mediaFilesData?.find((file) => file.resource_type === 'raw')?.secure_url;
  const coverLetter = req.mediaFilesData?.find((file) => file.resource_type === 'image')?.secure_url;

  if (!resume || !coverLetter) {
    throw new Error('Resume and cover letter are required');
  }

  job.applications.push({ applicant: userId, resume, coverLetter });
  await job.save();

  return { message: 'Job application submitted successfully' };
};

export const getApplicationStatusService = async (req) => {
  const userId = req.user._id;
  const { jobId } = req.params;

  const job = await Job.findById(jobId); 
  if (!job) throw new Error('Job not found');

  const application = job.applications.find(
    (app) => app.applicant.toString() === userId
  );
  if (!application) throw new Error('No application found for this job');

  return application.status;
};

export const saveJobForLaterService = async (req) => {
  const userId = req.user._id;
  const { jobId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const job = await Job.findById(jobId).select('-applications'); 
  if (!job) throw new Error('Job not found');

  if (user.savedJobs.includes(jobId)) throw new Error('Job already saved');
  user.savedJobs.push(jobId);

  await user.save();
  job.savedBy.push(userId);
  await job.save();

  return { message: 'Job saved successfully' };
};

export const getSavedJobsService = async (req) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate({
    path: 'savedJobs',
    select: '-applications', 
  });
  if (!user) throw new Error('User not found');

  if (!user.savedJobs || user.savedJobs.length === 0) {
    throw new Error('No saved jobs found');
  }

  return user.savedJobs;
};

export const reviewApplicationsService = async (req) => {
  const userId = req.user._id;
  const { jobId } = req.params;

  const job = await Job.findById(jobId).populate('applications.applicant', 'name email');
  if (!job) throw new Error('Job not found');
  if (job.postedBy.toString() !== userId) {
    throw new Error('You are not authorized to review applications for this job');
  }

  return job.applications;
};

export const contactCandidateService = async (req) => {
  const userId = req.user._id;
  const { jobId, candidateId } = req.params;
  const { message } = req.body;

  const job = await Job.findById(jobId).select('-applications'); 
  if (!job) throw new Error('Job not found');

  if (job.postedBy.toString() !== userId) {
    throw new Error('You are not authorized to contact candidates for this job');
  }

  const candidate = job.applications.find(
    (application) => application.applicant.toString() === candidateId
  );
  if (!candidate) throw new Error('Candidate not found for this job');

  return { message: `Message sent to candidate: ${message}` };
};

export const getjobId = async (jobId) => {
  const job = await Job.findById(jobId).select('_id'); 
  if (!job) throw new Error('Job not found');
  return job._id;
};

export const getAppliedJobsService = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'appliedJobs',
    populate: { path: 'company', select: 'name location industry' }, 
  });

  if (!user) throw new Error('User not found');

  if (!user.appliedJobs || user.appliedJobs.length === 0) {
    throw new Error('No applied jobs found');
  }

  return user.appliedJobs; 
};