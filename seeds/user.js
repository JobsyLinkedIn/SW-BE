import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';
import UserDetails from '../models/user_details.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if users already exist
    const existingUsers = await User.find();
    if (existingUsers.length > 0) {
      console.log('Users already exist. Seeding skipped.');
    } else {
      const users = [
        {
          name: 'john',
          email: 'john.doe@example.com',
          username: 'johndoe',
          password: 'password123',
          coverPicture: 'http://example.com/cover.jpg',
          profilePicture: 'http://example.com/profile.jpg',
          resume: 'http://example.com/resume.pdf',
          subscriptionPlan: 'Premium',
          createdAt: new Date(),
          updatedAt: new Date(),
          company: 'Barcelona',
        },
        {
          name: 'jane',
          email: 'jane.smith@example.com',
          username: 'janesmith',
          password: 'password456',
          coverPicture: 'http://example.com/cover2.jpg',
          profilePicture: 'http://example.com/profile2.jpg',
          resume: 'http://example.com/resume2.pdf',
          subscriptionPlan: 'Free',
          createdAt: new Date(),
          updatedAt: new Date(),
          company: 'Revive',
        },
      ];

      // Insert the users into the database
      const insertedUsers = await User.insertMany(users);
      console.log('Users seeded successfully!');

      const userDetails = [
        {
          user: insertedUsers[0]._id,
          industry: 'Software',
          location: 'New York',
          followers: [],
          connections: [],
          skills: ['JavaScript', 'Node.js', 'MongoDB'],
        },
        {
          user: insertedUsers[1]._id,
          industry: 'Marketing',
          location: 'California',
          followers: [],
          connections: [],
          skills: ['SEO', 'Google Analytics', 'Content Marketing'],
        },
      ];

      // Insert UserDetails into the database
      await UserDetails.insertMany(userDetails);
      console.log('UserDetails seeded successfully!');
    }
  } catch (err) {
    console.error('Seeding Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

export default seedUsers;
