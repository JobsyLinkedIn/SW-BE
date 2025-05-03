import checkIfUserFollowsCompany from '../../services/company/check_if_following_service.js';
import Company from '../../models/company.js';
import mongoose from 'mongoose';

jest.mock('../../models/company.js');

describe('checkIfUserFollowsCompany', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if the user follows the company', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockUserId = new mongoose.Types.ObjectId();
    const mockCompany = { followers: [mockUserId] };

    const mockSelect = jest.fn().mockResolvedValueOnce(mockCompany);
    Company.findById.mockReturnValueOnce({ select: mockSelect });

    const result = await checkIfUserFollowsCompany(mockCompanyId, mockUserId);

    expect(result).toBe(true);
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
    expect(mockSelect).toHaveBeenCalledWith('followers');
  });

  it('should return false if the user does not follow the company', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockUserId = new mongoose.Types.ObjectId();
    const mockCompany = { followers: [] };

    const mockSelect = jest.fn().mockResolvedValueOnce(mockCompany);
    Company.findById.mockReturnValueOnce({ select: mockSelect });

    const result = await checkIfUserFollowsCompany(mockCompanyId, mockUserId);

    expect(result).toBe(false);
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
    expect(mockSelect).toHaveBeenCalledWith('followers');
  });

  it('should throw an error if the company is not found', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockUserId = new mongoose.Types.ObjectId();

    const mockSelect = jest.fn().mockResolvedValueOnce(null);
    Company.findById.mockReturnValueOnce({ select: mockSelect });

    await expect(checkIfUserFollowsCompany(mockCompanyId, mockUserId)).rejects.toThrow('CompanyNotFound');
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
    expect(mockSelect).toHaveBeenCalledWith('followers');
  });
});