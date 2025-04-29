// adminService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js'; 
import { postModel as Post } from '../models/post.js';
import User from '../models/user.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;


export const loginAdmin = async ({ email, password }) => {

  let admin = await Admin.findOne({ email });
  if (!admin) throw new Error('Login failed. Make sure your email and password are correct');


  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error('Login failed. Make sure your email and password are correct');


  const token = jwt.sign({ adminId: admin._id, email: admin.email}, JWT_SECRET, {
    expiresIn: '7d',
  });

  return { msg: 'Logged in successfully', token, admin };
};

export const createAdmin = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = new Admin({ name, email, password: hashedPassword });

  await newAdmin.save();
  return newAdmin;
};


export const getUsersThisMonth = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1); 
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1); 
  endOfMonth.setDate(1); // Set to the first day of the next month
  endOfMonth.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000

  const users = await User.countDocuments({
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  });

  return users;
};


export const getPostsToday = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const posts = await Post.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  return posts;
};


