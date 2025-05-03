import * as authService from '../services/authServices.js';
import * as userModel from '../models/user.js';
import * as tokenUtils from '../utils/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

jest.mock('../models/user.js', () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
}));

jest.mock('../utils/auth.js', () => ({
  generateVerificationToken: jest.fn(),
  generateResetToken: jest.fn(),
  verifyToken: jest.fn(),
  generateToken: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-token'),
  verify: jest.fn(() => ({ email: 'test@example.com' })),
}));

process.env.JWT_SECRET = 'test-secret';

describe('Auth Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      userModel.findUserByEmail.mockResolvedValue(null);
      userModel.createUser.mockResolvedValue({ id: '123', email: 'test@example.com' });
      tokenUtils.generateVerificationToken.mockReturnValue('token');

      const res = await authService.registerUser({ name: 'Test', email: 'test@example.com', password: '123456' });

      expect(res).toHaveProperty('msg');
      expect(userModel.findUserByEmail).toHaveBeenCalled();
      expect(userModel.createUser).toHaveBeenCalled();
    });

    it('should throw if user already exists', async () => {
      userModel.findUserByEmail.mockResolvedValue({ email: 'test@example.com' });

      await expect(authService.registerUser({ name: 'Test', email: 'test@example.com', password: '123456' }))
        .rejects.toThrow('Email is already in use');
    });
  });

  describe('loginUser', () => {
    it('should login valid user', async () => {
      const mockUser = { _id: '123', email: 'test@example.com', password: await bcrypt.hash('123456', 10), isVerified: true };
      userModel.findUserByEmail.mockResolvedValue(mockUser);
      tokenUtils.generateToken.mockReturnValue('jwtToken');

      const res = await authService.loginUser({ email: 'test@example.com', password: '123456' });

      expect(res).toHaveProperty('token', 'jwtToken');
    });

    it('should throw if user not found', async () => {
      userModel.findUserByEmail.mockResolvedValue(null);

      await expect(authService.loginUser({ email: 'fake@example.com', password: '123456' }))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw if password is incorrect', async () => {
      const mockUser = { email: 'test@example.com', password: await bcrypt.hash('wrongpass', 10), isVerified: true };
      userModel.findUserByEmail.mockResolvedValue(mockUser);

      await expect(authService.loginUser({ email: 'test@example.com', password: '123456' }))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email with valid token', async () => {
      tokenUtils.verifyToken.mockReturnValue({ email: 'test@example.com' });
      userModel.findUserByEmail.mockResolvedValue({ email: 'test@example.com', isVerified: false });
      userModel.updateUser.mockResolvedValue(true);

      const res = await authService.verifyEmail('token');

      expect(res).toEqual({ msg: 'Email verified successfully' });
    });

    it('should throw for invalid token', async () => {
      tokenUtils.verifyToken.mockImplementation(() => { throw new Error('Invalid token'); });
      await expect(authService.verifyEmail('badtoken')).rejects.toThrow('Invalid token');
    });
  });

  describe('resendConfirmationEmail', () => {
    it('should send confirmation if not verified', async () => {
      userModel.findUserByEmail.mockResolvedValue({ email: 'test@example.com', isVerified: false });
      tokenUtils.generateVerificationToken.mockReturnValue('token');

      const res = await authService.resendConfirmationEmail('test@example.com');

      expect(res).toHaveProperty('msg');
    });

    it('should throw if already verified', async () => {
      userModel.findUserByEmail.mockResolvedValue({ email: 'test@example.com', isVerified: true });
      await expect(authService.resendConfirmationEmail('test@example.com')).rejects.toThrow('Email is already verified');
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset token', async () => {
      userModel.findUserByEmail.mockResolvedValue({ email: 'test@example.com' });
      tokenUtils.generateResetToken.mockReturnValue('reset-token');

      const res = await authService.forgotPassword('test@example.com');

      expect(res).toHaveProperty('msg');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      tokenUtils.verifyToken.mockReturnValue({ email: 'test@example.com' });
      userModel.findUserByEmail.mockResolvedValue({ email: 'test@example.com' });
      userModel.updateUser.mockResolvedValue(true);

      const res = await authService.resetPassword('token', 'newPass123');

      expect(res).toHaveProperty('msg');
    });
  });

  describe('changePassword', () => {
    it('should change password if current is correct', async () => {
      const hashed = await bcrypt.hash('oldPass', 10);
      userModel.findUserByEmail.mockResolvedValue({ email: 'test@example.com', password: hashed });
      userModel.updateUser.mockResolvedValue(true);

      const res = await authService.changePassword({ email: 'test@example.com', currentPassword: 'oldPass', newPassword: 'newPass123' });

      expect(res).toHaveProperty('msg');
    });

    it('should throw if current password is wrong', async () => {
      const hashed = await bcrypt.hash('oldPass', 10);
      userModel.findUserByEmail.mockResolvedValue({ email: 'test@example.com', password: hashed });

      await expect(authService.changePassword({ email: 'test@example.com', currentPassword: 'wrongPass', newPassword: 'newPass123' }))
        .rejects.toThrow('Current password is incorrect');
    });
  });

  describe('updateEmail', () => {
    it('should update email if password is correct', async () => {
      const hashed = await bcrypt.hash('userPass', 10);
      userModel.findUserByEmail.mockResolvedValue({ email: 'old@example.com', password: hashed });
      userModel.updateUser.mockResolvedValue(true);

      const res = await authService.updateEmail({ currentEmail: 'old@example.com', newEmail: 'new@example.com', password: 'userPass' });

      expect(res).toHaveProperty('msg');
    });
  });

  describe('updateUsername', () => {
    it('should update username from token', async () => {
      tokenUtils.verifyToken.mockReturnValue({ id: '123' });
      userModel.updateUser.mockResolvedValue(true);

      const res = await authService.updateUsername({ token: 'validToken', newUsername: 'newname' });

      expect(res).toHaveProperty('msg');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account with correct credentials', async () => {
      const hashed = await bcrypt.hash('userPass', 10);
      userModel.findUserByEmail.mockResolvedValue({ email: 'user@example.com', password: hashed });
      userModel.deleteUser.mockResolvedValue(true);

      const res = await authService.deleteAccount({ email: 'user@example.com', password: 'userPass' });

      expect(res).toHaveProperty('msg');
    });
  });
});
