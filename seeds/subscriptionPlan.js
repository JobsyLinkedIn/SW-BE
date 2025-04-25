import { subscriptionPlanModel } from '../models/subscriptionPlan.js';
import mongoose from 'mongoose';

const seedSubscriptionPlans = async () => {
  try {
    // Clear existing plans (optional)
    await subscriptionPlanModel.deleteMany({});

    const samplePlans = [
      {
        name: 'Free Plan',
        price: 0,
        duration: 30,
        features: ['Basic access to content'],
        description: 'Perfect for getting started with our platform',
        limitations: ['No premium content', 'Limited analytics', 'Basic customer support'],
        isActive: true,
        isFree: true,
        isDefault:true
      },
      {
        name: 'premium',
        price: 9.99,
        duration: 30,
        features: ['Unlimited content access', 'Priority support', 'Advanced analytics'],
        description: 'For professionals who need more power',
        limitations: ['No custom branding'],
        isActive: true,
        isFree: false,
      },
    ];

    const createdPlans = await subscriptionPlanModel.insertMany(samplePlans);
    console.log(`${createdPlans.length} subscription plans created successfully!`);
    return createdPlans;
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    throw error;
  }
};

// Usage (when connected to MongoDB)
// seedSubscriptionPlans().then(() => mongoose.connection.close());
export default seedSubscriptionPlans;
