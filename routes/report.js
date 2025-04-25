import express from 'express';
import {
  getPostReports,
  getUserReports,
  getCommentReports,
  getJobReports,
  fetchReportById,
  handleReportStatus,
} from '../controllers/reportController.js';
import authenticateAdmin from '../middlewares/authenticateAdmin.js';

const router = express.Router();

router.get('/posts',authenticateAdmin, getPostReports);
router.get('/comments',authenticateAdmin, getCommentReports);
router.get('/users',authenticateAdmin, getUserReports);
router.get('/jobs',authenticateAdmin, getJobReports);

router.get('/:id',authenticateAdmin, fetchReportById);
router.patch('/:id/status',authenticateAdmin, handleReportStatus);

export default router;
