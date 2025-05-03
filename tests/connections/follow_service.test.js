import follow_target_service from '../../services/connections/follow_service.js';
import User from '../../models/user.js';
import UserDetails from '../../models/user_details.js';
import Company from '../../models/company.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');
jest.mock('../../models/user_details.js');
jest.mock('../../models/company.js');

describe('follow_target_service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the follower user is not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    await expect(follow_target_service('follower@example.com', 'targetId', 'user')).rejects.toThrow('Follower user not found');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'follower@example.com' });
  });

  it('should throw an error if the target user is not found', async () => {
    User.findOne.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
    User.findById.mockResolvedValueOnce(null);

    await expect(follow_target_service('follower@example.com', 'targetId', 'user')).rejects.toThrow('Target user not found');
    expect(User.findById).toHaveBeenCalledWith('targetId');
  });

  it('should throw an error if the target company is not found', async () => {
    User.findOne.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
    Company.findById.mockResolvedValueOnce(null);

    await expect(follow_target_service('follower@example.com', 'targetId', 'company')).rejects.toThrow('Target company not found');
    expect(Company.findById).toHaveBeenCalledWith('targetId');
  });

  it('should throw an error if already following the user', async () => {
    const followerId = new mongoose.Types.ObjectId();
    const followedUserId = new mongoose.Types.ObjectId();

    User.findOne.mockResolvedValueOnce({ _id: followerId });
    User.findById.mockResolvedValueOnce({ _id: followedUserId });
    UserDetails.findOne.mockResolvedValueOnce({ followers: [followerId] });

    await expect(follow_target_service('follower@example.com', followedUserId, 'user')).rejects.toThrow('Already following this user');
  });

  it('should throw an error if already following the company', async () => {
    const followerId = new mongoose.Types.ObjectId();
    const companyId = new mongoose.Types.ObjectId();

    User.findOne.mockResolvedValueOnce({ _id: followerId });
    Company.findById.mockResolvedValueOnce({ followers: [followerId] });

    await expect(follow_target_service('follower@example.com', companyId, 'company')).rejects.toThrow('Already following this company');
  });

  it('should follow a user successfully', async () => {
    const followerId = new mongoose.Types.ObjectId();
    const followedUserId = new mongoose.Types.ObjectId();

    User.findOne.mockResolvedValueOnce({ _id: followerId });
    User.findById.mockResolvedValueOnce({ _id: followedUserId });
    const mockUserDetails = { followers: [], save: jest.fn().mockResolvedValueOnce() };
    UserDetails.findOne.mockResolvedValueOnce(mockUserDetails);

    const result = await follow_target_service('follower@example.com', followedUserId, 'user');

    expect(result).toEqual({ message: 'User followed successfully' });
    expect(mockUserDetails.followers).toContain(followerId);
    expect(mockUserDetails.save).toHaveBeenCalled();
  });

  it('should follow a company successfully', async () => {
    const followerId = new mongoose.Types.ObjectId();
    const companyId = new mongoose.Types.ObjectId();

    User.findOne.mockResolvedValueOnce({ _id: followerId });
    const mockCompany = { followers: [], save: jest.fn().mockResolvedValueOnce() };
    Company.findById.mockResolvedValueOnce(mockCompany);

    const result = await follow_target_service('follower@example.com', companyId, 'company');

    expect(result).toEqual({ message: 'Company followed successfully' });
    expect(mockCompany.followers).toContain(followerId);
    expect(mockCompany.save).toHaveBeenCalled();
  });

  it('should throw an error for an invalid target type', async () => {
    User.findOne.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });

    await expect(follow_target_service('follower@example.com', 'targetId', 'invalid')).rejects.toThrow('Invalid target type');
  });
});