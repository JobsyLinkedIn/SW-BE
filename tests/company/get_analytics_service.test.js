import getCompanyJobAnalytics from '../../services/company/get_analytics_service.js';
import Company from '../../models/company.js';
import Job from '../../models/jobs.js';
import mongoose from 'mongoose';

jest.mock('../../models/company.js');
jest.mock('../../models/jobs.js');

describe('getCompanyJobAnalytics', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return analytics data for a valid company', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockCompany = {
      _id: mockCompanyId,
      jobPostings: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      followers: [new mongoose.Types.ObjectId()],
      announcement: ['Announcement 1', 'Announcement 2']
    };

    const mockJobs = [
      { applications: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()] },
      { applications: [new mongoose.Types.ObjectId()] }
    ];

    const mockPopulate = jest.fn().mockResolvedValue(mockCompany);
    const mockFindById = jest.fn(() => ({ populate: mockPopulate }));
    Company.findById = mockFindById;

    Job.find.mockResolvedValue(mockJobs);

    const result = await getCompanyJobAnalytics(mockCompanyId);

    expect(result).toEqual({
      totalFollowers: mockCompany.followers.length,
      totalJobs: mockCompany.jobPostings.length,
      totalApplications: mockJobs.reduce((sum, job) => sum + job.applications.length, 0),
      totalAnnouncements: mockCompany.announcement.length
    });
  });

  it('should throw an error if the company is not found', async () => {
    const mockFindById = jest.fn(() => ({ populate: jest.fn().mockResolvedValue(null) }));
    Company.findById = mockFindById;

    await expect(getCompanyJobAnalytics(new mongoose.Types.ObjectId())).rejects.toThrow('Company not found');
  });
});