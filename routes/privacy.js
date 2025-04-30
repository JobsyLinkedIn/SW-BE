import * as privacy_controller from '../controllers/privacy_controller.js'
import authenticateUser from '../middlewares/authenticateUser.js';
import express from 'express';
const router = express.Router();

router.put('/user/connection-privacy', authenticateUser, privacy_controller.sendConnectionRequestController);
router.post('/report/user/:targetUserId', authenticateUser, privacy_controller.reportUserController);
router.post('/report/post/:postId', authenticateUser, privacy_controller.reportPostController);
router.patch('/users/change-privacy', authenticateUser ,privacy_controller.changeConnectionPrivacy);
router.get('/user/privacy', authenticateUser, privacy_controller.getConnectionPrivacy);

export default router;
