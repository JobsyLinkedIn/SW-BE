import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../data_base/user.js'; 

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.find();
    if (existingUsers.length > 0) {
      console.log('Users already exist. Seeding skipped.');
    } else {
      const users = [
        { email: 'john.doe@example.com', username: 'johndoe', password: 'password123' },
        { email: 'jane.smith@example.com', username: 'janesmith', password: 'password456' },
      ];

      await User.insertMany(users);
      console.log('Users seeded successfully!');
    }
  } catch (err) {
    console.error('Seeding Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

export default seedUsers;
