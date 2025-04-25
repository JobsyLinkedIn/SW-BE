import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import {
  createStripePaymentService,
  verifyPaymentService,
} from '../../services/stripePayment/stripePaymentServices.js';
/**
 * CheckOut
 * @description Handle Stripe Checkout
 * @route   /api/subscription-plan-payment/chechout
 * @method   POST
 * @access   Private
 */
const createPaymentCtrl = asyncHandler(async (req, res) => {
  //Get The Plan ID
  const planId = req.body?.planId;
  //Get The User Id
  const userId = req.user?._id;
  const { clientSecret, paymentIntentId } = await createStripePaymentService(planId, userId);
  res.status(200).json({
    clientSecret: clientSecret,
    paymentIntentId: paymentIntentId,
    subscriptionPlanId: planId,
  });
});

/**
 * verify
 * @route   /api/subscription-plan-payment/verify-payment/:paymentId
 * @method   GET
 * @access   Private
 */
const verifyPaymentCtrl = asyncHandler(async (req, res) => {
  //Get The Payment Intent Id
  const { paymentId } = req.params;
  const { user, status, message } = await verifyPaymentService(paymentId);
  res.status(200).json({
    status,
    message,
    user,
  });
});
export { createPaymentCtrl, verifyPaymentCtrl };
