import { subscriptionPlanModel } from '../models/subscriptionPlan.js';

async function makeUserOnDefaultFreePlan(user) {
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
  return {
    success: !!defaultFreePlan,
    newPlan: defaultFreePlan,
    message: defaultFreePlan ? 'Downgraded to default free plan' : 'No default free plan available',
  };
}

export { makeUserOnDefaultFreePlan };
