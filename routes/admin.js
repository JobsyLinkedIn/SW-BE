import express from 'express';
import { registerAdmin, adminLogin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', adminLogin);

export default router;
