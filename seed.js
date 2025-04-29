import 'dotenv/config';
import mongoose from 'mongoose';
import seedUsers from './seeds/user.js';
import seedCompanies from './seeds/company.js';
import seedPosts from './seeds/post.js';
import seedComments from './seeds/comment.js';
import seedCompaniesFollowers from './seeds/companyFollowers.js';
import seedSubscriptionPlans from './seeds/subscriptionPlan.js';
const MONGO_URI = process.env.MONGO_URI;

const seedAll = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined. Check your .env file.');
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB');
    }
    await seedCompanies();
    // await seedSubscriptionPlans();
    await seedUsers();
    await seedCompaniesFollowers();
    await seedPosts();
    await seedComments();

    console.log('All entities seeded successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedAll();
