import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/jobs.js';
import Company from '../models/company.js';
import User from '../models/user.js';

dotenv.config();

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingJobs = await Job.find();
    if (existingJobs.length > 0) {
      console.log('Jobs already exist. Seeding skipped.');
      await mongoose.disconnect();
      return;
    }

    const companies = await Company.find();
    const users = await User.find();

    if (companies.length === 0 || users.length === 0) {
      console.log('No companies or users found. Please seed companies and users first.');
      await mongoose.disconnect();
      return;
    }

    const [company1, company2] = companies;
    const [user1, user2] = users;

    const jobs = [
      {
        title: 'Software Engineer',
        description: 'Develop and maintain web applications.',
        location: 'New York',
        industry: 'Technology',
        experienceLevel: 'Mid',
        salary: 90000,
        company: company1._id,
        postedBy: user1._id,
      },
      {
        title: 'Marketing Specialist',
        description: 'Plan and execute marketing campaigns.',
        location: 'California',
        industry: 'Marketing',
        experienceLevel: 'Entry',
        salary: 60000,
        company: company2._id,
        postedBy: user2._id,
      },
    ];

    await Job.insertMany(jobs);
    console.log('Jobs seeded successfully!');
  } catch (err) {
    console.error('Seeding Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

export default seedJobs;