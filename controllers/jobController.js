import {
  createJobService,
  searchJobsService,
  applyForJobService,
  getApplicationStatusService,
  saveJobForLaterService,
  getSavedJobsService,
  reviewApplicationsService,
  contactCandidateService,
  getAppliedJobsService,
  filterJobsService,
  getJobIdsService,
} from '../services/jobServices.js';

export const filterJobs = async (req, res) => {
  try {
    const { location, industry, salaryRange, jobType, experienceLevel, company, page, limit } = req.query;
    const filteredJobs = await filterJobsService(
      { location, industry, salaryRange, jobType, experienceLevel, company },
      page,
      limit
    );
    res.status(200).json(filteredJobs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const job = await createJobService(req.body, req.user._id);
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const searchJobs = async (req, res) => {
  try {
    const { keyword, location, industry, page, limit } = req.query;
    const jobs = await searchJobsService(keyword, location, industry, page, limit);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const applyForJob = async (req, res) => {
  try {
    const response = await applyForJobService(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getApplicationStatus = async (req, res) => {
  try {
    const status = await getApplicationStatusService(req);
    res.status(200).json({ status });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const saveJobForLater = async (req, res) => {
  try {
    const response = await saveJobForLaterService(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await getSavedJobsService(req);
    res.status(200).json(savedJobs);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const reviewApplications = async (req, res) => {
  try {
    const applications = await reviewApplicationsService(req);
    res.status(200).json(applications);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const contactCandidate = async (req, res) => {
  try {
    const response = await contactCandidateService(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const appliedJobs = await getAppliedJobsService(userId);
    res.status(200).json(appliedJobs);
  } catch (error) {
    res.status(404).json({ message: error.message }); 
  }
};

export const getJobIds = async (req, res) => {
  try {
    const jobIds = await getJobIdsService();
    res.status(200).json(jobIds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};