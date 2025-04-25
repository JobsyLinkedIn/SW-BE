import {
    createJobService,
    searchJobsService,
    applyForJobService,
    getApplicationStatusService,
    saveJobForLaterService,
     getSavedJobsService, 
     reviewApplicationsService, 
     contactCandidateService } from '../services/jobServices.js';

  
  export const createJob = async (req, res) => {
    try {
      const jobData = { ...req.body, postedBy: req.user._id };
      const job = await createJobService(jobData);
      res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const searchJobs = async (req, res) => {
    try {
      const { keyword, location, industry, experienceLevel, salaryRange, page, limit } = req.query;
      const filters = { keyword, location, industry, experienceLevel, salaryRange };
      const jobs = await searchJobsService(filters, page, limit);
      res.status(200).json(jobs);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const applyForJob = async (req, res) => {
    try {
      const { jobId } = req.params;
      const userId = req.user._id;
      const response = await applyForJobService(jobId, userId);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const getApplicationStatus = async (req, res) => {
    try {
      const { jobId } = req.params;
      const userId = req.user._id;
      const status = await getApplicationStatusService(jobId, userId);
      res.status(200).json({ status });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

 export const saveJobForLater = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;
    const response = await saveJobForLaterService(userId, jobId);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const savedJobs = await getSavedJobsService(userId);
    res.status(200).json(savedJobs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reviewApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await reviewApplicationsService(jobId);
    res.status(200).json(applications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const contactCandidate = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    const { message } = req.body;
    const response = await contactCandidateService(jobId, candidateId, message);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};