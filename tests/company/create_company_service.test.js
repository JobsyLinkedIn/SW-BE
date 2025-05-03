import { createCompany } from '../../services/company/create_company_service';
import Company from '../../models/company';
import User from '../../models/user';

jest.mock('../../models/company');
jest.mock('../../models/user');

describe('createCompany Service', () => {
  const mockUserId = 'mockUserId';
  const mockCompanyData = {
    name: 'Test Company',
    industry: 'Tech',
    location: 'San Francisco',
    logo: 'logo.png',
    description: 'A test company',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if required fields are missing', async () => {
    const incompleteData = { name: 'Test Company' };

    await expect(createCompany(incompleteData, mockUserId)).rejects.toThrow(
      'Please provide all required fields: name, industry, location.'
    );
  });

  // it('should create a company and associate it with the user', async () => {
  //   const mockCompany = { _id: 'mockCompanyId', ...mockCompanyData };

  //   Company.mockImplementation(() => ({
  //     save: jest.fn().mockResolvedValue({ _id: 'mockCompanyId', ...mockCompanyData }),
  //   }));

  //   User.findByIdAndUpdate.mockResolvedValue({});

  //   const result = await createCompany(mockCompanyData, mockUserId);

  //   expect(Company).toHaveBeenCalledWith({
  //     ...mockCompanyData,
  //     createdBy: mockUserId,
  //   });
  //   expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, {
  //     $push: { companyOwned: mockCompany._id },
  //   });
  //   expect(result).toEqual(mockCompany);
  // });

  it('should throw an error if saving to the database fails', async () => {
    Company.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Database error')),
    }));

    await expect(createCompany(mockCompanyData, mockUserId)).rejects.toThrow(
      'Error saving company to database.'
    );
  });
});