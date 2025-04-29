import express from 'express';
import authenticateUser from '../middlewares/authenticateUser.js';
import uploadByMulter from '../middlewares/multer/multer.js';
import cloudinaryUploadFiles from '../middlewares/uploadToCloudinary/uploadFilesToCloudinary.js';
import {
  createJob,
  searchJobs,
  applyForJob,
  getApplicationStatus,
  saveJobForLater,
  getSavedJobs,
  reviewApplications,
  contactCandidate,
  filterJobs,
  getAppliedJobs,
  getJobIds,
  getJobDetailsById,
  reportJob,
} from '../controllers/jobController.js';

const router = express.Router();
router.use(authenticateUser);

router.post('/', createJob);
router.get('/', searchJobs);
router.post(
  '/:jobId/apply',
  uploadByMulter.array('files', 2), 
  cloudinaryUploadFiles, 
  applyForJob 
);
router.get('/:jobId/status', getApplicationStatus);
router.post('/:jobId/save', saveJobForLater);
router.get('/saved', getSavedJobs);
router.get('/:jobId/applications', reviewApplications);
router.post('/:jobId/contact/:candidateId', contactCandidate);
router.get('/filter', filterJobs); 
router.get('/applied', getAppliedJobs);
router.get('/filter', filterJobs);
router.get('/jobs/ids', getJobIds);//getter for job ids for front end usage
router.get('/:jobId/details', getJobDetailsById); 
router.post('/jobs/:jobId/report', authenticateUser, reportJob);


export default router;