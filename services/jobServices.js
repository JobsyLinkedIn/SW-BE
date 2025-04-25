import Job from '../models/job.js';
import User from '../models/user.js';

export const createJobService = async (jobData) => {
  const job = new Job(jobData);
  await job.save();
  return job;
};

export const searchJobsService = async (filters, page = 1, limit = 10) => {
  const query = {};

  if (filters.keyword) query.title = new RegExp(filters.keyword, 'i');
  if (filters.location) query.location = new RegExp(filters.location, 'i');
  if (filters.industry) query.industry = new RegExp(filters.industry, 'i');
  if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
  if (filters.salaryRange) query.salaryRange = filters.salaryRange;

  const jobs = await Job.find(query)
    .populate('company', 'name')
    .skip((page - 1) * limit)
    .limit(limit);

  const totalJobs = await Job.countDocuments(query);

  return { jobs, totalJobs, totalPages: Math.ceil(totalJobs / limit) };
};

export const applyForJobService = async (jobId, userId) => {
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');
  
    const alreadyApplied = job.applicants.some((applicant) => applicant.user.toString() === userId);
    if (alreadyApplied) throw new Error('You have already applied for this job');
  
    job.applicants.push({ user: userId });
    await job.save();
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
  
    user.appliedJobs.push(jobId);
    await user.save();
  
    return { message: 'Job application submitted successfully' };
  };

export const getApplicationStatusService = async (jobId, userId) => {
  const job = await Job.findById(jobId).populate('applicants.user', 'name email');
  if (!job) throw new Error('Job not found');

  const application = job.applicants.find((applicant) => applicant.user._id.toString() === userId);
  if (!application) throw new Error('No application found for this job');

  return application.status;
};


export const saveJobForLaterService = async (userId, jobId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.savedJobs.includes(jobId)) throw new Error('Job already saved');

  user.savedJobs.push(jobId);
  await user.save();

  return { message: 'Job saved successfully' };
};


export const getSavedJobsService = async (userId) => {
  const user = await User.findById(userId).populate('savedJobs');
  if (!user) throw new Error('User not found');

  return user.savedJobs;
};

export const reviewApplicationsService = async (jobId) => {
  const job = await Job.findById(jobId).populate('applicants.user', 'name email');
  if (!job) throw new Error('Job not found');

  return job.applicants;
};

export const contactCandidateService = async (jobId, candidateId, message) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const candidate = job.applicants.find((applicant) => applicant.user.toString() === candidateId);
  if (!candidate) throw new Error('Candidate not found for this job');

  return { message: `Message sent to candidate: ${message}` };
};