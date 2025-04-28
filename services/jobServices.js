import Job from '../models/jobs.js';
import User from '../models/user.js';
import Company from '../models/company.js';
import mongoose from 'mongoose';

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
  if (company._id) {
  company.jobPostings.push(job._id);
  await company.save();
  }
  return job;
};

export const filterJobsService = async (filters, page = 1, limit = 10) => {
  const query = {};

  // Dynamically add filters to the query if they are provided
  if (filters.location) {
    query.location = new RegExp(filters.location, 'i'); // Case-insensitive match
  }

  if (filters.industry) {
    query.industry = new RegExp(filters.industry, 'i'); // Case-insensitive match
  }

  if (filters.salaryRange) {
    const [minSalary, maxSalary] = filters.salaryRange.split('-').map(Number);
    query.salary = { $gte: minSalary, $lte: maxSalary };
  }

  if (filters.experienceLevel) {
    query.experienceLevel = filters.experienceLevel;
  }

  if (filters.company) {
    const company = await Company.findOne({ name: new RegExp(filters.company, 'i') });
    if (company) {
      query.company = company._id;
    } else {
      // If no company matches, return empty results
      return { jobs: [], totalJobs: 0, totalPages: 0 };
    }
  }

  // Fetch jobs based on the dynamically built query
  const jobs = await Job.find(query)
    .select('-applications') // Exclude applications field
    .populate('company', 'name') // Populate company name
    .skip((page - 1) * limit)
    .limit(limit);

  // Count total jobs matching the query
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

  // Validate jobId
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID');
  }

  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const alreadyApplied = job.applications.some(
    (application) => application.applicant.toString() === userId
  );

  if (alreadyApplied) throw new Error('You have already applied for this job');

  if (!req.mediaFilesData || req.mediaFilesData.length < 2) {
    throw new Error('Resume and cover letter are required');
  }

  const resume = req.mediaFilesData[0]?.secure_url;
  const coverLetter = req.mediaFilesData[1]?.secure_url;

  if (!resume || !coverLetter) {
    throw new Error('Resume and cover letter are required');
  }

  // Include the `job` field when pushing a new application
  job.applications.push({ job: job._id, applicant: userId, resume, coverLetter });
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

  const job = await Job.findById(jobId)
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

export const getJobIdsService = async () => {
  const jobs = await Job.find({}, '_id title'); // Fetch only job IDs and titles
  return jobs.map(job => ({ id: job._id, title: job.title }));
};

export const getJobDetailsByIdService = async (jobId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID');
  }

  const job = await Job.findById(jobId)
    .select('-applications') // Exclude applications field
    .populate('company', 'name location industry'); // Populate company details

  if (!job) {
    throw new Error('Job not found');
  }

  return job;
};