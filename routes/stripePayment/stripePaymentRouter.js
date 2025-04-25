import express from 'express';
const router = express.Router();
import authenticateUser from '../../middlewares/authenticateUser.js';
import {
  createPaymentCtrl,
  verifyPaymentCtrl,
} from '../../controllers/stripePayment/stripePaymentController.js';
//api/subscription-plan-payment/chechout
router.post('/chechout', authenticateUser, createPaymentCtrl);

// /api/subscription-plan-payment/verify-payment/:paymentId
router.get('/verify-payment/:paymentId', authenticateUser, verifyPaymentCtrl);

export default router;
