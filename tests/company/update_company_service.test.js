import updateCompany from '../../services/company/update_company_service.js';
import Company from '../../models/company.js';
import mongoose from 'mongoose';

jest.mock('../../models/company.js');

describe('updateCompany', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the company and return the updated document', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockUpdatedData = { name: 'Updated Company Name' };
    const mockUpdatedCompany = { _id: mockCompanyId, ...mockUpdatedData };

    Company.findByIdAndUpdate.mockResolvedValueOnce(mockUpdatedCompany);

    const result = await updateCompany(mockCompanyId, mockUpdatedData);

    expect(result).toEqual(mockUpdatedCompany);
    expect(Company.findByIdAndUpdate).toHaveBeenCalledWith(
      mockCompanyId,
      mockUpdatedData,
      { new: true }
    );
  });

  it('should throw an error if the update fails', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockUpdatedData = { name: 'Updated Company Name' };

    Company.findByIdAndUpdate.mockRejectedValueOnce(new Error('Update failed'));

    await expect(updateCompany(mockCompanyId, mockUpdatedData)).rejects.toThrow('Error updating company');
    expect(Company.findByIdAndUpdate).toHaveBeenCalledWith(
      mockCompanyId,
      mockUpdatedData,
      { new: true }
    );
  });
});