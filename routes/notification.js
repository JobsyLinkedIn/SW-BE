import express from 'express';
import * as notificationsController from '../controllers/notificationsController.js';
import authenticateUser from '../middlewares/authenticateUser.js';

const router = express.Router();


router.post('/createnotification', authenticateUser, notificationsController.createNotification);

router.get('/:userId',authenticateUser,notificationsController.getUserNotifications);


router.patch('/:id/read',authenticateUser, notificationsController.markAsRead);

router.get('/:userId/unseen-count',authenticateUser,notificationsController.getUnseenCount);

export default router;
