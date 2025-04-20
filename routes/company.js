import express from 'express';
import * as company_controller from '../controllers/company_controller.js'
import authenticateUser from '../middlewares/authenticateUser.js';
const router = express.Router();

router.post('/company', authenticateUser, company_controller.createCompanyController);
router.put('/company/:companyId', authenticateUser,company_controller.updateCompanyDetails);
router.post('/job', authenticateUser, company_controller.createJobController);
router.get('/company/:companyId/applications', authenticateUser, company_controller.fetchJobApplications);
router.get('/company/:companyId/analytics', authenticateUser, company_controller.fetchJobAnalytics);


export default router;
