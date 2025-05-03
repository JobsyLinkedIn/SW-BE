import createJobService from '../../services/company/job_posting_service.js';
import Job from '../../models/jobs.js';
import Company from '../../models/company.js';
import mongoose from 'mongoose';

jest.mock('../../models/jobs.js');
jest.mock('../../models/company.js');

describe('createJobService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new job and update the company job postings', async () => {
    const mockJobData = { title: 'Software Engineer', description: 'Job description', company: new mongoose.Types.ObjectId() };
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockSavedJob = { _id: new mongoose.Types.ObjectId(), ...mockJobData };

    Job.prototype.save = jest.fn().mockResolvedValueOnce(mockSavedJob);
    Company.findByIdAndUpdate = jest.fn().mockResolvedValueOnce({});

    const result = await createJobService(mockJobData, mockCompanyId);

    expect(result).toEqual(mockSavedJob);
    expect(Job.prototype.save).toHaveBeenCalled();
    expect(Company.findByIdAndUpdate).toHaveBeenCalledWith(
      mockCompanyId,
      { $push: { jobPostings: mockSavedJob._id } },
      { new: true }
    );
  });

  it('should throw an error if job creation fails', async () => {
    const mockJobData = { title: 'Software Engineer', description: 'Job description', company: new mongoose.Types.ObjectId() };
    const mockCompanyId = new mongoose.Types.ObjectId();

    Job.prototype.save = jest.fn().mockRejectedValueOnce(new Error('Job creation failed'));

    await expect(createJobService(mockJobData, mockCompanyId)).rejects.toThrow('Job creation failed');
    expect(Job.prototype.save).toHaveBeenCalled();
    expect(Company.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should throw an error if updating the company fails', async () => {
    const mockJobData = { title: 'Software Engineer', description: 'Job description', company: new mongoose.Types.ObjectId() };
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockSavedJob = { _id: new mongoose.Types.ObjectId(), ...mockJobData };

    Job.prototype.save = jest.fn().mockResolvedValueOnce(mockSavedJob);
    Company.findByIdAndUpdate = jest.fn().mockRejectedValueOnce(new Error('Company update failed'));

    await expect(createJobService(mockJobData, mockCompanyId)).rejects.toThrow('Company update failed');
    expect(Job.prototype.save).toHaveBeenCalled();
    expect(Company.findByIdAndUpdate).toHaveBeenCalledWith(
      mockCompanyId,
      { $push: { jobPostings: mockSavedJob._id } },
      { new: true }
    );
  });
});