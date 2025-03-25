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
      return existingCompanies;
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
    }
  } catch (err) {
    console.error('Seeding Error:', err);
  }
};

export default seedCompanies;
