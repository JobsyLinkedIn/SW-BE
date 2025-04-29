import express from 'express';
import * as company_controller from '../controllers/company_controller.js'
import authenticateUser from '../middlewares/authenticateUser.js';
import authorizeCompanyUser from '../middlewares/authenticateUserCompany.js';
import uploadByMulter from '../middlewares/multer/multer.js';
import cloudinaryUploadFiles from '../middlewares/uploadToCloudinary/uploadFilesToCloudinary.js';

const router = express.Router();

router.post('/company', authenticateUser, company_controller.createCompanyController);
router.put('/company/:companyId', authenticateUser,authorizeCompanyUser,company_controller.updateCompanyDetails);
router.post('/job/:companyId', authenticateUser,authorizeCompanyUser ,company_controller.createJobController);
router.get('/company/:companyId/applications', authenticateUser,company_controller.fetchJobApplications);
router.get('/company/:companyId/analytics', authenticateUser, authorizeCompanyUser,company_controller.fetchJobAnalytics);
router.delete('/:companyId/followers/:userId',authenticateUser ,company_controller.removeFollowerController);
router.post('/company/:companyId/announcement', authenticateUser,authorizeCompanyUser, uploadByMulter.array('media'), cloudinaryUploadFiles, company_controller.createCompanyAnnouncement);
router.get('/company/:companyId', authenticateUser, company_controller.getCompanyById);
router.get('/company/:companyId/jobs', authenticateUser, company_controller.getCompanyJobs);
// router.get('/company/:companyId/followers-count', company_controller.getCompanyFollowersCount);
router.get('/company/:companyId/followers', authenticateUser,authorizeCompanyUser ,company_controller.getCompanyFollowers);

export default router;
