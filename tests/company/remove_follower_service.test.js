import removeFollowerService from '../../services/company/remove_follower_service.js';
import User from '../../models/user.js';
import Company from '../../models/company.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');
jest.mock('../../models/company.js');

describe('removeFollowerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should remove a follower from the company successfully', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockFollowerId = new mongoose.Types.ObjectId();

    const mockCompany = {
      _id: mockCompanyId,
      followers: [mockFollowerId],
      save: jest.fn().mockResolvedValueOnce(),
    };

    const mockFollower = {
      _id: mockFollowerId,
      followingCompanies: [mockCompanyId],
      save: jest.fn().mockResolvedValueOnce(),
    };

    Company.findById.mockResolvedValueOnce(mockCompany);
    User.findById.mockResolvedValueOnce(mockFollower);

    const result = await removeFollowerService(mockCompanyId, mockFollowerId);

    expect(result).toEqual({ message: 'Follower removed from company successfully' });
    expect(mockCompany.followers).toEqual([]);
    expect(mockFollower.followingCompanies).toEqual([]);
    expect(mockCompany.save).toHaveBeenCalled();
    expect(mockFollower.save).toHaveBeenCalled();
  });

  it('should throw an error if the company is not found', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockFollowerId = new mongoose.Types.ObjectId();

    Company.findById.mockResolvedValueOnce(null);

    await expect(removeFollowerService(mockCompanyId, mockFollowerId)).rejects.toThrow('Company not found');
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
  });

  it('should throw an error if the follower is not found', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockFollowerId = new mongoose.Types.ObjectId();

    const mockCompany = { _id: mockCompanyId, followers: [mockFollowerId] };

    Company.findById.mockResolvedValueOnce(mockCompany);
    User.findById.mockResolvedValueOnce(null);

    await expect(removeFollowerService(mockCompanyId, mockFollowerId)).rejects.toThrow('Follower not found');
    expect(User.findById).toHaveBeenCalledWith(mockFollowerId);
  });

  it('should throw an error if the user is not a follower of the company', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockFollowerId = new mongoose.Types.ObjectId();

    const mockCompany = { _id: mockCompanyId, followers: [] };
    const mockFollower = { _id: mockFollowerId, followingCompanies: [mockCompanyId] };

    Company.findById.mockResolvedValueOnce(mockCompany);
    User.findById.mockResolvedValueOnce(mockFollower);

    await expect(removeFollowerService(mockCompanyId, mockFollowerId)).rejects.toThrow('This user is not a follower of the company');
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
    expect(User.findById).toHaveBeenCalledWith(mockFollowerId);
  });
});