import getCompanyJobsService from '../../services/company/get_jobs_service.js';
import Job from '../../models/jobs.js';
import mongoose from 'mongoose';

jest.mock('../../models/jobs.js');

describe('getCompanyJobsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return jobs for a valid companyId', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockJobs = [
      { _id: new mongoose.Types.ObjectId(), title: 'Job 1', company: mockCompanyId },
      { _id: new mongoose.Types.ObjectId(), title: 'Job 2', company: mockCompanyId }
    ];

    Job.find.mockResolvedValueOnce(mockJobs);

    const result = await getCompanyJobsService(mockCompanyId);

    expect(result).toEqual(mockJobs);
    expect(Job.find).toHaveBeenCalledWith({ company: mockCompanyId });
  });

  it('should return an empty array if no jobs are found for the companyId', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();

    Job.find.mockResolvedValueOnce([]);

    const result = await getCompanyJobsService(mockCompanyId);

    expect(result).toEqual([]);
    expect(Job.find).toHaveBeenCalledWith({ company: mockCompanyId });
  });
});