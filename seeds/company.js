import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/company.js';
import User from '../models/user.js';
const seedCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if companies already exist
    const existingCompanies = await Company.find();
    if (existingCompanies.length > 0) {
      console.log('Companies already exist. Seeding skipped.');
    } else {
      const companies = [
        {
          name: 'Tech Corp',
          industry: 'Technology',
          location: 'New York',
          logo: 'http://example.com/logo1.png',
          description: 'A leading company in tech innovation.',
        },
        {
          name: 'Marketing Pro',
          industry: 'Marketing',
          location: 'California',
          logo: 'http://example.com/logo2.png',
          description: 'Experts in digital marketing.',
        },
      ];

      const insertedCompanies = await Company.insertMany(companies);
      console.log('Companies seeded successfully!');

      const users = await User.find(); // Fetch all existing users

      // Add some followers for each company (for demonstration purposes)
      if (users.length > 0) {
        for (const company of insertedCompanies) {
          // Randomly assign 1-3 followers from the existing users
          const randomFollowers = users
            .sort(() => 0.5 - Math.random()) // Shuffle users
            .slice(0, Math.floor(Math.random() * 3) + 1); // Get 1 to 3 random users

          // Update the company with these followers
          company.followers = randomFollowers.map((user) => user._id);
          await company.save();
        }

        console.log('Followers added to companies.');
      }
    }
  } catch (err) {
    console.error('Seeding Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

export default seedCompanies;
