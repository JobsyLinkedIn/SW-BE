import 'dotenv/config'; 
import mongoose from 'mongoose';
import seedUsers from "./seeds/user.js"
import seedCompanies from "./seeds/company.js"
const MONGO_URI = process.env.MONGO_URI;

const seedAll = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Check your .env file.");
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await seedUsers(); 
    await seedCompanies();
    
    console.log('All entities seeded successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedAll();
