import {
  createPlanCtrl,
  getAllPlansCtrl,
  getPlanByIdCtrl,
  cancelSubscriptionCtrl,
  getUserSubscriptionDetailsCtrl,
} from '../controllers/subscriptionPlanController.js';
import { subscriptionMiddleware } from '../middlewares/subscriptionPlanMiddleware.js';
import authenticateUser from '../middlewares/authenticateUser.js';

import express from 'express';
const router = express.Router();

//GET   /api/subscription-plan/my-subscription
router.get(
  '/my-subscription',
  authenticateUser,
  subscriptionMiddleware,
  getUserSubscriptionDetailsCtrl
);
router
  .route('/')
  // POST /api/subscription-plan/
  .post(createPlanCtrl)
  // GET /api/subscription-plan/
  .get(getAllPlansCtrl);

router
  .route('/:id')
  // GET /api/subscription-plan/:id
  .get(getPlanByIdCtrl);

// delete /api/subscription-plan/:subscriptionPlanId
router.delete(
  '/:subscriptionPlanId',
  authenticateUser,
  subscriptionMiddleware,
  cancelSubscriptionCtrl
);

export default router;
