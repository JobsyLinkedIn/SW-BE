import asyncHandler from 'express-async-handler';
import {
  createPlanService,
  getAllPlansService,
  getPlanByIdService,
  cancelSubscriptionService,
  getUserSubscriptionDetailsService,
} from '../services/subscriptionPlanService.js';
/**-------------------------------------------------------
 *
 * @desc     Create a Subscription plan
 * @route   /api/subscription-plan/
 * @method   POST
 * @access   Private [Only Admin]
 *
 *-------------------------------------------------------*/

const createPlanCtrl = asyncHandler(async (req, res) => {
  /*
  #ToDo : use middleware to verify that: 
    -admin only can add subscriptionPlan
  */
  const {
    planName = null,
    price = null,
    durationInDays = null,
    features = [],
    limitations = [],
    description,
  } = req.body;
  // Call Service
  const plan = await createPlanService({
    planName,
    price: Number(price),
    durationInDays: Number(durationInDays),
    features,
    limitations,
    description,
  });

  res.status(201).json({ message: 'plan added successfully', plan });
});

/**-------------------------------------------------------
 *
 * @desc     Get All Subscription plans
 * @route   /api/subscription-plan/
 * @method   GET
 * @access   Public
 *
 *-------------------------------------------------------*/
const getAllPlansCtrl = asyncHandler(async (req, res) => {
  const plans = await getAllPlansService();
  res.status(200).json({ plans: plans });
});

/**-------------------------------------------------------
 *
 * @desc     Get single subscription plan By Id
 * @route   /api/subscription-plan/:id
 * @method   GET
 * @access   Public
 *
 *-------------------------------------------------------*/

const getPlanByIdCtrl = asyncHandler(async (req, res, next) => {
  const plan = await getPlanByIdService(req.params.id);
  res.status(200).json({
    success: true,
    data: plan,
  });
});

/**-------------------------------------------------------
 *
 * @desc     Get single subscription plan By Id
 * @route   /api/subscription-plan/:subscriptionPlanId
 * @method   DELETE
 * @access   Private (Only User)
 *
 *-------------------------------------------------------*/
const cancelSubscriptionCtrl = asyncHandler(async (req, res) => {
  const { subscriptionPlanId } = req.params.subscriptionPlanId;
  const userId = req.user?._id;
  const { planId, isFree, isDefaultFreePlan } = req.userPlan;

  const { resStatus, success, message } = await cancelSubscriptionService(
    userId,
    subscriptionPlanId,
    planId,
    isFree,
    isDefaultFreePlan
  );
  return res.status(resStatus).json({
    success,
    message,
  });
});
/**-------------------------------------------------------
 *
 * @desc     Get single subscription plan By Id
 * @route   /api/subscription-plan/my-subscription/:subscriptionPlanId
 * @method   GET
 * @access   Private (Only User)
 *
 *-------------------------------------------------------*/
const getUserSubscriptionDetailsCtrl = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const subscriptionDetails = await getUserSubscriptionDetailsService(userId);
  if (!subscriptionDetails) {
    res.status(200).json({
      subscriptionDetails: null,
      message: 'You are not enrolled in the plan.',
    });
  } else {
    res.status(200).json({
      subscriptionDetails: subscriptionDetails,
      message: 'Subscription data extracted successfully',
    });
  }
});

export {
  createPlanCtrl,
  getAllPlansCtrl,
  getPlanByIdCtrl,
  cancelSubscriptionCtrl,
  getUserSubscriptionDetailsCtrl,
};
