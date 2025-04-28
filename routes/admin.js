import express from 'express';
import { registerAdmin, adminLogin, getPlatformAnalytics} from '../controllers/adminController.js';
import authenticateAdmin from '../middlewares/authenticateAdmin.js';
const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', adminLogin);
router.get('/analytics',authenticateAdmin,getPlatformAnalytics);

export default router;
