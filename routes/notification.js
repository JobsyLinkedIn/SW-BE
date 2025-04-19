import express from 'express';
import * as notificationsController from '../controllers/notificationsController.js';

const router = express.Router();

router.post('/createnotification', notificationsController.createNotification);

router.get('/:userId', notificationsController.getUserNotifications);


router.patch('/:id/read', notificationsController.markAsRead);


router.get('/:userId/unseen-count', notificationsController.getUnseenCount);

export default router;
