import Job from '../models/jobs.js';
import User from '../models/user.js';
import Company from '../models/company.js';
import mongoose from 'mongoose';
import Report from '../models/report.js';

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

export const filterJobsService = async (filters = {}, page = 1, limit = 10) => {
  const query = {};


  const location = filters.location?.trim();
  const industry = filters.industry?.trim();
  const salaryRange = filters.salaryRange?.trim();
  const experienceLevel = filters.experienceLevel?.trim();
  const companyName = filters.company?.trim();

  const hasValidFilters = location || industry || salaryRange || experienceLevel || companyName;
  if (!hasValidFilters) {
    return { jobs: [], totalJobs: 0, totalPages: 0 };
  }

  if (location) {
    query.location = new RegExp(location, 'i');
  }

  if (industry) {
    query.industry = new RegExp(industry, 'i');
  }

  if (salaryRange && salaryRange.includes('-')) {
    const [minSalary, maxSalary] = salaryRange.split('-').map(Number);
    if (!isNaN(minSalary) && !isNaN(maxSalary)) {
      query.salary = { $gte: minSalary, $lte: maxSalary };
    }
  }

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  if (companyName) {
    const company = await Company.findOne({ name: new RegExp(companyName, 'i') });
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
  const totalPages = Math.ceil(totalJobs / limit);

  return { jobs, totalJobs, totalPages };
};

export const searchJobsService = async (keyword = '', location = '', industry = '', page = 1, limit = 10) => {
  const query = {};

  const titleKeyword = keyword.trim();
  const locationInput = location.trim();
  const industryInput = industry.trim();

  if (titleKeyword) {
    query.title = new RegExp(titleKeyword, 'i');
  }

  if (locationInput) {
    query.location = new RegExp(locationInput, 'i');
  }

  if (industryInput) {
    query.industry = new RegExp(industryInput, 'i');
  }

  if (Object.keys(query).length === 0) {
    return { jobs: [], totalJobs: 0, totalPages: 0 };
  }

  const jobs = await Job.find(query)
    .select('_id title location company')
    .populate('company', 'name')
    .skip((page - 1) * limit)
    .limit(limit);

  const totalJobs = await Job.countDocuments(query);
  const totalPages = Math.ceil(totalJobs / limit);

  return { jobs, totalJobs, totalPages };
};




export const applyForJobService = async (req) => {
  const userId = req.user._id;
  const { jobId } = req.params;

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

  job.applications.push({
    applicant: userId,
    resume,
    coverLetter,
    status: 'pending',
    job: jobId,
  });
  await job.save();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user.appliedJobs.includes(jobId)) {
    user.appliedJobs.push(jobId);
    await user.save();
  }

  return { message: 'Job application submitted successfully' };
};

export const getApplicationStatusService = async (req) => {
  const userId = req.user._id;
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const application = job.applications.find(
    (app) => app.applicant.toString() === userId.toString()
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

  if (!user.savedJobs.includes(jobId)) {
    user.savedJobs.push(jobId);
    await user.save();
  }

  if (!job.savedBy.includes(userId)) {
    job.savedBy.push(userId);
    await job.save();
  }

  return { message: 'Job saved successfully' };
};

export const getSavedJobsService = async (req) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate({
    path: 'savedJobs',
     select: '-applications -savedBy'
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

  if (job.postedBy.toString() !== userId.toString()) {
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
    select: '-applications -savedBy'
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
    .select('_id title description location company') // Include jobId (_id) in the response
    .populate('company', 'name location industry');

  if (!job) {
    throw new Error('Job not found');
  }

  return job;
};


export const reportJobService = async (userId, jobId, reason, details) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID');
  }
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }
  const report = new Report({
    type: 'job',
    targetId: jobId,
    reason,
    details,
    reportedBy: userId,
  });

  await report.save();

  return { message: 'Job reported successfully' };
};

export const updateApplicationStatusService = async (userId, jobId, applicantId, status) => {
  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(applicantId)) {
    throw new Error('Invalid Job ID or Applicant ID');
  }

  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  if (job.postedBy.toString() !== userId.toString()) {
    throw new Error('You are not authorized to update the application status for this job');
  }
  const application = job.applications.find(
    (app) => app.applicant.toString() === applicantId
  );
  if (!application) throw new Error('Application not found');

  application.status = status;
  await job.save();

  return { message: `Application status updated to ${status}` };
};

export const deleteJobService = async (userId, jobId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID');
  }

  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');
  if (job.postedBy.toString() !== userId.toString()) {
    throw new Error('You are not authorized to delete this job');
  }
  await Job.findByIdAndDelete(jobId);

  return { message: 'Job deleted successfully' };
};