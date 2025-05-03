import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as adminServices from '../services/adminServices.js';
import Admin from '../models/admin.js';
import User from '../models/user.js';
import { postModel as Post } from '../models/post.js';

jest.mock('../models/admin.js');
jest.mock('../models/user.js');
jest.mock('../models/post.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

process.env.ADMIN_JWT_SECRET = 'testsecret';

describe('Admin Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdmin', () => {
    it('should hash password and create new admin', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const saveMock = jest.fn().mockResolvedValue(true);

      const mockAdmin = {
        name: 'Test Admin',
        email: 'admin@example.com',
        save: saveMock,
      };

      Admin.mockImplementation(() => mockAdmin);

      const result = await adminServices.createAdmin({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'pass123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
      expect(result.name).toBe('Test Admin');
      expect(result.email).toBe('admin@example.com');
    });
  });

  describe('loginAdmin', () => {
    it('should login successfully with valid credentials', async () => {
      const mockAdmin = {
        _id: '123',
        email: 'admin@example.com',
        password: 'hashedPass',
      };

      Admin.findOne.mockResolvedValue(mockAdmin);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const result = await adminServices.loginAdmin({
        email: 'admin@example.com',
        password: 'pass123',
      });

      expect(result.token).toBe('mockToken');
      expect(result.msg).toBe('Logged in successfully');
    });

    it('should fail if email not found', async () => {
      Admin.findOne.mockResolvedValue(null);

      await expect(
        adminServices.loginAdmin({
          email: 'notfound@example.com',
          password: 'pass123',
        })
      ).rejects.toThrow('Login failed. Make sure your email and password are correct');
    });

    it('should fail if password does not match', async () => {
      Admin.findOne.mockResolvedValue({ password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        adminServices.loginAdmin({ email: 'admin@example.com', password: 'wrongpass' })
      ).rejects.toThrow('Login failed. Make sure your email and password are correct');
    });
  });

  describe('getUsersThisMonth', () => {
    it('should return number of users registered this month', async () => {
      User.countDocuments.mockResolvedValue(12);
      const result = await adminServices.getUsersThisMonth();
      expect(typeof result).toBe('number');
      expect(result).toBe(12);
    });
  });

  describe('getPostsToday', () => {
    it('should return number of posts today', async () => {
      Post.countDocuments.mockResolvedValue(5);
      const result = await adminServices.getPostsToday();
      expect(typeof result).toBe('number');
      expect(result).toBe(5);
    });
  });
});
