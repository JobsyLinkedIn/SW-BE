import getCompaniesOwnedByUser from '../../services/company/get_companies_owned_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('getCompaniesOwnedByUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the companies owned by the user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockCompanies = [
      { _id: new mongoose.Types.ObjectId(), name: 'Company 1', industry: 'Tech', logo: 'logo1.png' },
      { _id: new mongoose.Types.ObjectId(), name: 'Company 2', industry: 'Finance', logo: 'logo2.png' }
    ];
    const mockUser = { companyOwned: mockCompanies };

    User.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce(mockUser)
    });

    const result = await getCompaniesOwnedByUser(mockUserId);

    expect(result).toEqual(mockCompanies);
    expect(User.findById).toHaveBeenCalledWith(mockUserId);
  });


  it('should throw an error if there is an issue fetching companies', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    User.findById.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    await expect(getCompaniesOwnedByUser(mockUserId)).rejects.toThrow('Error fetching companies owned by user');
    expect(User.findById).toHaveBeenCalledWith(mockUserId);
  });
});