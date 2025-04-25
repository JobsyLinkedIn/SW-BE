import Stripe from 'stripe';
import User from '../../models/user.js';
import {
  subscriptionPlanModel as subscriptionPlan,
  subscriptionPlanModel,
} from '../../models/subscriptionPlan.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { areValidObjectIds } from '../../utils/validateDB.js';
import { paymentModel } from '../../models/payment.js';

const createStripePaymentService = async (planId, userId) => {
  try {
    //1- Check For the Valid Id of the Plan
    if (!areValidObjectIds([planId])) {
      const error = new Error('Plan not found');
      error.statusCode = 400;
      throw error;
    }
    //2- Check if the user is Exist
    const userIsExist = await User.exists({ _id: userId });
    if (!userIsExist) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    //2- Get the Plan
    const plan = await subscriptionPlan.findById(planId);
    if (!plan) {
      const error = new Error('Plan not found');
      error.statusCode = 404;
      throw error;
    } else {
      //Create Payment Intent/making the payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.price * 100, // convert to cent
        currency: 'usd',
        //add some metaData
        metadata: {
          userId: userId.toString(),
          subscriptionPlanId: planId,
        },
      });
      // Return BOTH the client_secret AND paymentIntent.id
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    }
  } catch (error) {
    throw error;
  }
};

const verifyPaymentService = async (paymentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    // -Check the Payment Status
    if (paymentIntent.status !== 'succeeded') {
      // -GET The Data From The MetaData of The Payment Intent
      const metaData = paymentIntent?.metadata;
      const subscriptionPlanId = metaData?.subscriptionPlanId;
      const userId = metaData?.userId;
      // -Find the User
      const user = await User.findById(userId).select(
        'hasSelectedPlan subscriptionPlan email _id subscriptionEndDate subscriptionStartDate'
      );
      if (!user) {
        throw { statusCode: 404, message: 'User not found' };
      }
      //Get more details about Payment
      const amount = paymentIntent?.amount / 100; // convert to "dollar" from "cent"
      const subscriptionPlan = await subscriptionPlanModel.findById(subscriptionPlanId);
      const currency = paymentIntent.currency;
      if (!subscriptionPlan || subscriptionPlan.price !== amount) {
        throw { statusCode: 404, message: 'Subscription Plan not found' };
      }
      const newPayment = await paymentModel.create({
        user: userId,
        currency: currency,
        status: 'success',
        subscriptionPlan: subscriptionPlanId,
        amount: amount,
        paymentId: paymentId,
      });

      if (newPayment) {
        //Update User Profile
        const subscriptionStartDate = newPayment.createdAt;
        const subscriptionEndDate = new Date(subscriptionStartDate);
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + subscriptionPlan.duration);
        user.hasSelectedPlan = true;
        user.subscriptionPlan = subscriptionPlanId;
        user.subscriptionStart = subscriptionStartDate;
        user.subscriptionEnd = subscriptionEndDate;
        //resave
        await user.save();
      }
      return {
        status: true,
        message: 'Payment Verified , user updated',
        user: user,
      };
    } else {
      return {
        status: false,
        message: 'Payment not completed yet',
        user: null,
      };
    }
  } catch (error) {
    throw error;
  }
};

export { createStripePaymentService, verifyPaymentService };
