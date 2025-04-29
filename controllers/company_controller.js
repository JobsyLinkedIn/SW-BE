import createCompany from "../services/company/create_company_service.js";
import updateCompany from "../services/company/update_company_service.js";
import  createJobService  from "../services/company/job_posting_service.js";
import getCompanyJobAnalytics from "../services/company/get_analytics_service.js";
import getCompanyJobApplications from "../services/company/get_application_service.js";
import remove_follower_service from "../services/company/remove_follower_service.js";
import { createPostService } from "../services/postService.js";
import getCompanyByIdService from '../services/company/get_id_service.js';
import getCompanyJobsService from '../services/company/get_jobs_service.js';
import getCompanyFollowersCountService from '../services/company/get_followers_service.js';

export const createCompanyController = async (req, res) => {
  try {
    const companyData = req.body;
    const createdCompany = await createCompany(companyData, req.user._id); 
    
    res.status(201).json({
      message: 'Company profile created successfully!',
      company: createdCompany
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating company profile.', error: err.message });
  }
};

export const updateCompanyDetails = async (req, res) => {
  try {
    const { companyId } = req.params; 
    const { logo, description, industry, location } = req.body;  

    const updatedCompany = await updateCompany(companyId, { logo, description, industry, location });

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json(updatedCompany);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const createJobController = async (req, res) => {
  try {
    const jobData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      industry: req.body.industry,
      experienceLevel: req.body.experienceLevel,
      salary: req.body.salary,
      company: req.body.companyId,
      postedBy: req._id,
    };

    const newJob = await createJobService(jobData);
    res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    res.status(500).json({ message: 'Error posting job', error });
  }
};

export const fetchJobApplications = async (req, res) => {
  try {
    const apps = await getCompanyJobApplications(req.params.companyId);
    res.status(200).json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const fetchJobAnalytics = async (req, res) => {
  try {
    const data = await getCompanyJobAnalytics(req.params.companyId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeFollowerController = async (req, res) => {
  try {
    const { companyId, userId } = req.params;

    const result = await remove_follower_service(companyId, userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const createCompanyAnnouncement = async (req, res) => {
  try {
    const { content, taggedUsersIds = [], links = [] } = req.body;
    const UploadedFiles = req.mediaFilesData || [];
    const userId = req.user._id;
    const post = await createPostService({ userId, content, taggedUsersIds, links, UploadedFiles });
    res.status(201).json({ message: 'Post created successfully', post });

  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};


export const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await getCompanyByIdService(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getCompanyJobs = async (req, res) => {
  try {
    const { companyId } = req.params;
    const jobs = await getCompanyJobsService(companyId);

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getCompanyFollowersCount = async (req, res) => {
  try {
    const { companyId } = req.params;

    const followersCount = await getCompanyFollowersCountService(companyId);
    res.status(200).json({ followersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching followers count', error: error.message });
  }
};

