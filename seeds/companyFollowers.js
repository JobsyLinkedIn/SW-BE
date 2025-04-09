import User from '../models/user.js';
import Company from '../models/company.js';

const seedCompaniesFollowers = async () => {
  try {
    const users = await User.find();
    const companies = await Company.find();

    if (users.length > 0 && companies.length > 0) {
      for (const company of companies) {
        const randomFollowers = users
          .sort(() => 0.5 - Math.random()) // Shuffle users
          .slice(0, Math.floor(Math.random() * 3) + 1)
          .map((user) => user._id); // Extract user IDs

        // Update the company with these followers
        company.followers = randomFollowers;
        await company.save();
      }
      console.log('Followers successfully added to companies.');
    } else {
      console.log('No users or companies found.');
    }
  } catch (error) {
    console.error('Error seeding followers:', error);
  }
};

export default seedCompaniesFollowers;
