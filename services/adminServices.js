// adminService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js'; 

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
