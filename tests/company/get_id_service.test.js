import getCompanyByIdService from '../../services/company/get_id_service.js';
import Company from '../../models/company.js';
import mongoose from 'mongoose';

jest.mock('../../models/company.js');

describe('getCompanyByIdService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the company for a valid companyId', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockCompany = { _id: mockCompanyId, name: 'Test Company' };

    Company.findById.mockResolvedValueOnce(mockCompany);

    const result = await getCompanyByIdService(mockCompanyId);

    expect(result).toEqual(mockCompany);
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
  });

  it('should return null if the company is not found', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();

    Company.findById.mockResolvedValueOnce(null);

    const result = await getCompanyByIdService(mockCompanyId);

    expect(result).toBeNull();
    expect(Company.findById).toHaveBeenCalledWith(mockCompanyId);
  });
});