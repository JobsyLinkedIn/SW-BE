import { getCompanyFollowersService } from '../../services/company/get_attributes_follower_service.js';
import Company from '../../models/company.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/company.js');
jest.mock('../../models/user.js');

describe('getCompanyFollowersService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

//   it('should return followers of the company', async () => {
//     const mockCompanyId = new mongoose.Types.ObjectId();
//     const mockFollowers = [
//       { _id: new mongoose.Types.ObjectId(), name: 'John Doe', email: 'john@example.com', profilePicture: 'john.jpg' },
//       { _id: new mongoose.Types.ObjectId(), name: 'Jane Smith', email: 'jane@example.com', profilePicture: 'jane.jpg' },
//     ];

//     const mockCompany = { _id: mockCompanyId, followers: mockFollowers.map(follower => follower._id) };

//     Company.findById.mockResolvedValueOnce(mockCompany);
//     User.find.mockResolvedValueOnce(mockFollowers);

//     const result = await getCompanyFollowersService(mockCompanyId);

//     expect(result).toEqual(mockFollowers);
//     expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
//     expect(User.find).toHaveBeenCalledWith({ _id: { $in: mockCompany.followers } });
//   });

  it('should throw an error if the company is not found', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();

    Company.findById.mockResolvedValueOnce(null);

    await expect(getCompanyFollowersService(mockCompanyId)).rejects.toThrow('Company not found');
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
  });

  it('should throw an error if there is an issue fetching followers', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockCompany = { _id: mockCompanyId, followers: [new mongoose.Types.ObjectId()] };

    Company.findById.mockResolvedValueOnce(mockCompany);
    User.find.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    await expect(getCompanyFollowersService(mockCompanyId)).rejects.toThrow('Database error');
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
    expect(User.find).toHaveBeenCalledWith({ _id: { $in: mockCompany.followers } });
  });
});