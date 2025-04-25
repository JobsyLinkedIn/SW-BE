import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/company.js';
import User from '../models/user.js';

dotenv.config();

const seedCompanies = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      const existingCompanies = await Company.find();
  
      if (existingCompanies.length > 0) {
        console.log('Companies already exist. Seeding skipped.');
        await mongoose.disconnect();
        return;
      }
  
      let users = await User.find();
  
      // If no users, create 1 or 2 default users
      if (users.length === 0) {
        console.log('No users found, creating default users...');
        users = await User.insertMany([
          {
            name: 'Admin User 1',
            email: 'admin1@example.com',
            password: 'password123', // Make sure to hash in real code
          },
          {
            name: 'Admin User 2',
            email: 'admin2@example.com',
            password: 'password123', // Make sure to hash in real code
          },
        ]);
        console.log('Default users created!');
      }
  
      // Assign the first user to the companies
      const [user1, user2] = users;
      
      const companies = [
        {
          name: 'Tech Corp',
          industry: 'Technology',
          location: 'New York',
          logo: 'http://example.com/logo1.png',
          description: 'A leading company in tech innovation.',
          createdBy: user1._id, // Assign to user1
        },
        {
          name: 'Marketing Pro',
          industry: 'Marketing',
          location: 'California',
          logo: 'http://example.com/logo2.png',
          description: 'Experts in digital marketing.',
          createdBy: user2._id, // Assign to user2
        },
      ];
  
      await Company.insertMany(companies);
      console.log('Companies seeded successfully!');
    } catch (err) {
      console.error('Seeding Error:', err);
    } finally {
      await mongoose.disconnect();
    }
  };
export default seedCompanies;
