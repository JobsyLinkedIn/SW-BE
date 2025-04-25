import { areValidObjectIds } from '../utils/validateDB.js';
import { subscriptionPlanModel as subscriptionPlan } from '../models/subscriptionPlan.js';
import { makeUserOnDefaultFreePlan } from '../utils/subscriptionUtils.js';
import User from '../models/user.js';

/**
 * Create a new premium plan
 * @param {Object} planData - Plan data
 * @param {string} planData.planName - Name of the plan
 * @param {number} planData.price - Price of the plan
 * @param {number} planData.durationInDays - Duration in days
 * @param {Array} planData.features - Array of features
 * @param {Array} planData.limitations - Array of limitations
 * @returns {Promise<Object>} Created plan
 */
const createPlanService = async ({
  planName,
  price,
  durationInDays,
  features,
  limitations,
  description,
}) => {
  try {
    // Check if plan with same name already exists
    const existingPlan = await subscriptionPlan.findOne({ name: planName });
    if (existingPlan) {
      throw { statusCode: 400, message: `Plan with name '${planName}' already exists` };
    }

    // validations
    if (!planName?.trim()) {
      throw { statusCode: 400, message: 'Plan name is required' };
    }
    if (typeof price !== 'number' || price < 0) {
      throw { statusCode: 400, message: 'Price must be a positive number' };
    }

    if (!Number.isInteger(durationInDays) || durationInDays < 0) {
      throw { statusCode: 400, message: 'Duration in days must be a positive integer' };
    }

    // Create new plan
    const newPlan = new subscriptionPlan({
      name: planName,
      price,
      duration: durationInDays,
      features,
      limitations,
      description,
      isActive: true,
      isFree: price === 0,
    });

    // Save to database
    const savedPlan = await newPlan.save();

    return {
      id: savedPlan._id,
      name: savedPlan.name,
      price: savedPlan.price,
      duration: savedPlan.duration,
      features: savedPlan.features,
      limitations: savedPlan.limitations,
      isActive: savedPlan.isActive,
      createdAt: savedPlan.createdAt,
      isFree: savedPlan.isFree,
    };
  } catch (error) {
    console.error('Error in createPlanService:', error);
    throw error; // Re-throw the error for the controller to handle
  }
};
/**
 * Retrieves all available plans from the service.
 *
 * @async
 * @returns {Promise<Object>} A promise that resolves to an object containing all plans.
 * @throws {Error} If there's an error while fetching the plans.
 */
const getAllPlansService = async () => {
  try {
    const plans = await subscriptionPlan.find();
    return plans;
  } catch (error) {
    console.error('Error in getAllPlansService:', error);
    throw error; // Re-throw the error for the controller to handle
  }
};

/**
 * Fetches a subscription plan by ID
 * @param {string} planId - The ID of the plan to fetch
 * @returns {Promise<Object>} The found plan
 * @throws {Error} If plan is not found or ID is invalid
 */
const getPlanByIdService = async (planId) => {
  // ✅ Validate Plan ObjectId
  if (!areValidObjectIds([planId])) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }
  // Ensure PLan exists
  const plan = await subscriptionPlan.findById(planId);
  if (!plan) {
    const error = new Error('plan not found');
    error.statusCode = 404;
    throw error;
  } else {
    return plan;
  }
};

const cancelSubscriptionService = async (
  userId,
  planId,
  currentUserPlanId,
  currentUserPlanIsFree,
  currentUserPlanIsDefaultFree
) => {
  //Find User
  const user = await User.findById({ _id: userId });
  if (!user) {
    return {
      resStatus: 404,
      success: false,
      message: 'User not found',
    };
  }

  // Check if user is on default free plan
  if (currentUserPlanIsDefaultFree && currentUserPlanId) {
    return {
      resStatus: 400,
      success: false,
      message: 'Cannot cancel default free plan ,Upgrade to a paid plan first',
    };
  }
  // Verify ownership
  if (planId !== currentUserPlanId) {
    return {
      resStatus: 403,
      success: false,
      message: 'Subscription not found or not owned by user',
    };
  }
  //Cancel Subscribtion and Make user On default free paln if exist
  const { success, message } = await makeUserOnDefaultFreePlan(user);
  if (success) {
    return {
      resStatus: 200,
      success: true,
      message: message,
    };
  } else {
    return {
      resStatus: 200,
      success: true,
      message: 'User now without Plan',
    };
  }
};

const getUserSubscriptionDetailsService = async (userId) => {
  const user = await User.findById({ _id: userId }).populate('subscriptionPlan');
  try {
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    if (!user.hasSelectedPlan) {
      return null;
    } else {
      return {
        subscriptionPlanName: user.subscriptionPlan.name,
        subscriptionPlanPrice: user.subscriptionPlan.price,
        subscriptionPlanLimitations: user.subscriptionPlan.limitations,
        subscriptionPlanFeatures: user.subscriptionPlan.features,
        subscriptionPlanStartIn: user.subscriptionStart,
        subscriptionPlanEndIn: user.subscriptionEnd,
      };
    }
  } catch (error) {
    throw error;
  }
};

export {
  createPlanService,
  getAllPlansService,
  getPlanByIdService,
  cancelSubscriptionService,
  getUserSubscriptionDetailsService,
};
