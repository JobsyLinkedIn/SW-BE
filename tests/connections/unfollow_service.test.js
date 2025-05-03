import unfollow_target_service from '../../services/connections/unfollow_service.js';
import User from '../../models/user.js';
import UserDetails from '../../models/user_details.js';
import Company from '../../models/company.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');
jest.mock('../../models/user_details.js');
jest.mock('../../models/company.js');

describe('unfollow_target_service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the follower user is not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    await expect(unfollow_target_service('follower@example.com', 'targetId', 'user')).rejects.toThrow('Follower user not found');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'follower@example.com' });
  });

  it('should throw an error if the followed user is not found', async () => {
    User.findOne.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
    User.findById.mockResolvedValueOnce(null);

    await expect(unfollow_target_service('follower@example.com', 'targetId', 'user')).rejects.toThrow('Followed user not found');
    expect(User.findById).toHaveBeenCalledWith('targetId');
  });

  it('should throw an error if the user details for the followed user are not found', async () => {
    User.findOne.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
    User.findById.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
    UserDetails.findOne.mockResolvedValueOnce(null);

    await expect(unfollow_target_service('follower@example.com', 'targetId', 'user')).rejects.toThrow('User details not found for the followed user');
  });

  it('should throw an error if the follower is not following the user', async () => {
    const followerId = new mongoose.Types.ObjectId();
    const followedId = new mongoose.Types.ObjectId();

    User.findOne.mockResolvedValueOnce({ _id: followerId });
    User.findById.mockResolvedValueOnce({ _id: followedId });
    UserDetails.findOne.mockResolvedValueOnce({ followers: [] });

    await expect(unfollow_target_service('follower@example.com', followedId, 'user')).rejects.toThrow('You are not following this user');
  });

  it('should unfollow a user successfully', async () => {
    const followerId = new mongoose.Types.ObjectId();
    const followedId = new mongoose.Types.ObjectId();

    const mockUserDetails = {
      followers: [followerId],
      save: jest.fn().mockResolvedValueOnce(),
    };

    User.findOne.mockResolvedValueOnce({ _id: followerId });
    User.findById.mockResolvedValueOnce({ _id: followedId });
    UserDetails.findOne.mockResolvedValueOnce(mockUserDetails);

    const result = await unfollow_target_service('follower@example.com', followedId, 'user');

    expect(result).toEqual({ message: 'user unfollowed successfully' });
    expect(mockUserDetails.followers).not.toContain(followerId);
    expect(mockUserDetails.save).toHaveBeenCalled();
  });

  it('should throw an error if the company is not found', async () => {
    User.findOne.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
    Company.findById.mockResolvedValueOnce(null);

    await expect(unfollow_target_service('follower@example.com', 'targetId', 'company')).rejects.toThrow('Company not found');
    expect(Company.findById).toHaveBeenCalledWith('targetId');
  });

  it('should throw an error if the follower is not following the company', async () => {
    const followerId = new mongoose.Types.ObjectId();

    User.findOne.mockResolvedValueOnce({ _id: followerId });
    Company.findById.mockResolvedValueOnce({ followers: [] });

    await expect(unfollow_target_service('follower@example.com', 'targetId', 'company')).rejects.toThrow('You are not following this company');
  });

  it('should unfollow a company successfully', async () => {
    const followerId = new mongoose.Types.ObjectId();
    const companyId = new mongoose.Types.ObjectId();

    const mockCompany = {
      followers: [followerId],
      save: jest.fn().mockResolvedValueOnce(),
    };

    User.findOne.mockResolvedValueOnce({ _id: followerId });
    Company.findById.mockResolvedValueOnce(mockCompany);

    const result = await unfollow_target_service('follower@example.com', companyId, 'company');

    expect(result).toEqual({ message: 'company unfollowed successfully' });
    expect(mockCompany.followers).not.toContain(followerId);
    expect(mockCompany.save).toHaveBeenCalled();
  });

  it('should throw an error for an invalid targetType', async () => {
    User.findOne.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });

    await expect(unfollow_target_service('follower@example.com', 'targetId', 'invalid')).rejects.toThrow('Invalid targetType');
  });
});