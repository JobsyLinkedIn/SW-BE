import User from '../models/user.js';
import Company from '../models/company.js';

const seedCompaniesFollowers = async () => {
    try {
      const companies = await Company.find();
      const users = await User.find();
  
      if (companies.length === 0 || users.length === 0) {
        console.log('Cannot seed followers: missing users or companies.');
        return;
      }
  
      for (const company of companies) {
        // Choose first 3 users as followers
        const selectedUsers = users.slice(0, 3).map(user => user._id);
  
        // Ensure no duplicates
        const uniqueFollowers = new Set([...company.followers, ...selectedUsers]);
        company.followers = Array.from(uniqueFollowers);
  
        await company.save(); // Update existing company only
      }
  
      console.log('Company followers seeded!');
    } catch (err) {
      console.error('Error seeding followers:', err);
    }
  };
export default seedCompaniesFollowers;
