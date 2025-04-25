import { subscriptionPlanModel } from '../models/subscriptionPlan.js';
import User from '../models/user.js';
import asyncHandler from 'express-async-handler';

const subscriptionMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('subscriptionPlan');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let UserOnDefaultFreePlan = false;
    // Check for expired paid subscriptions
    if (user.hasSelectedPlan && user.subscriptionPlan && !user.subscriptionPlan.isFree) {
      const now = new Date();
      const isSubscriptionActive = now < new Date(user.subscriptionEnd);

      if (!isSubscriptionActive) {
        UserOnDefaultFreePlan = await MakeUserOnDefaultFreePlan(user);
      }
    }
    // Handle users without any plan or with free plan
    else if (!user.hasSelectedPlan || !user.subscriptionPlan) {
      UserOnDefaultFreePlan = await MakeUserOnDefaultFreePlan(user);
    } else {
      UserOnDefaultFreePlan = user.subscriptionPlan.isFree && user.subscriptionPlan.isDefault;
    }

    // Attach plan info to request
    req.userPlan = {
      planId: user.subscriptionPlan?._id.toString() ?? null,
      isFree: user.subscriptionPlan?.isFree ?? false,
      isDefaultFreePlan: UserOnDefaultFreePlan,
    };
    next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    next(error);
  }
});

// Helper function to downgrade to free plan
async function MakeUserOnDefaultFreePlan(user) {
  // Find default free plan
  const defaultFreePlan = await subscriptionPlanModel.findOne({
    isDefault: true,
    isFree: true,
  });
  if (defaultFreePlan) {
    user.subscriptionPlan = defaultFreePlan._id;
    user.subscriptionEndDate = null;
    user.subscriptionStartDate = new Date();
    user.hasSelectedPlan = true;
  } else {
    user.subscriptionPlan = null;
    user.subscriptionEndDate = null;
    user.subscriptionStartDate = null;
    user.hasSelectedPlan = false;
  }
  await user.save();
  return !!defaultFreePlan;
}

export { subscriptionMiddleware };
