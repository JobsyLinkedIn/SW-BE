import express from 'express';
import authenticateUser, { authorizeCompany } from '../middlewares/authenticateUser.js';
import {
  createJob,
  searchJobs,
  applyForJob,
  getApplicationStatus,
  saveJobForLater,
  getSavedJobs,
  reviewApplications,
  contactCandidate,
} from '../controllers/jobController.js';

const router = express.Router();

router.use(authenticateUser);
router.post('/', authorizeCompany, createJob);
router.get('/', searchJobs);
router.post('/:jobId/apply', applyForJob);
router.get('/:jobId/status', getApplicationStatus);
router.post('/:jobId/save', saveJobForLater);
router.get('/saved', getSavedJobs);
router.get('/:jobId/applications', authorizeCompany, reviewApplications);
router.post('/:jobId/contact/:candidateId', authorizeCompany, contactCandidate);

export default router;