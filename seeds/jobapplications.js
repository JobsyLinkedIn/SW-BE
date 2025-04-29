import mongoose from 'mongoose';
import dotenv from 'dotenv';
import JobApplication from '../models/job_application.js';
import Job from '../models/jobs.js';
import User from '../models/user.js';

dotenv.config();

const seedJobApplications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingApplications = await JobApplication.find();
    if (existingApplications.length > 0) {
      console.log('Job applications already exist. Seeding skipped.');
      await mongoose.disconnect();
      return;
    }

    const jobs = await Job.find();
    const users = await User.find();

    if (jobs.length === 0 || users.length === 0) {
      console.log('No jobs or users found. Please seed jobs and users first.');
      await mongoose.disconnect();
      return;
    }

    const [job1, job2] = jobs;
    const [user1, user2] = users;

    const applications = [
      {
        job: job1._id,
        applicant: user1._id,
        resume: 'http://example.com/resume1.pdf',
        coverLetter: 'I am excited to apply for this position.',
        status: 'pending',
      },
      {
        job: job2._id,
        applicant: user2._id,
        resume: 'http://example.com/resume2.pdf',
        coverLetter: 'Looking forward to contributing to your team.',
        status: 'pending',
      },
    ];

    await JobApplication.insertMany(applications);
    console.log('Job applications seeded successfully!');
  } catch (err) {
    console.error('Seeding Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

export default seedJobApplications;