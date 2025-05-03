import getCompanyJobApplications from '../../services/company/get_application_service.js';
import JobApplication from '../../models/job_application.js';
import mongoose from 'mongoose';

jest.mock('../../models/job_application.js');

describe('getCompanyJobApplications', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return job applications for a specific company', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockJobId = new mongoose.Types.ObjectId();
    const mockApplications = [
      {
        _id: new mongoose.Types.ObjectId(),
        job: { _id: mockJobId, company: mockCompanyId },
        applicant: { name: 'John Doe', email: 'john@example.com', resume: 'resume.pdf' },
      },
      {
        _id: new mongoose.Types.ObjectId(),
        job: { _id: mockJobId, company: mockCompanyId },
        applicant: { name: 'Jane Smith', email: 'jane@example.com', resume: 'resume.pdf' },
      },
    ];

    JobApplication.find.mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementationOnce((callback) => callback(mockApplications)),
    });

    const result = await getCompanyJobApplications(mockCompanyId);

    expect(result).toEqual(mockApplications);
    expect(JobApplication.find).toHaveBeenCalled();
  });

  it('should filter out applications with null jobs', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();
    const mockApplications = [
      {
        _id: new mongoose.Types.ObjectId(),
        job: null,
        applicant: { name: 'John Doe', email: 'john@example.com', resume: 'resume.pdf' },
      },
      {
        _id: new mongoose.Types.ObjectId(),
        job: { _id: new mongoose.Types.ObjectId(), company: mockCompanyId },
        applicant: { name: 'Jane Smith', email: 'jane@example.com', resume: 'resume.pdf' },
      },
    ];

    JobApplication.find.mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementationOnce((callback) => callback(mockApplications)),
    });

    const result = await getCompanyJobApplications(mockCompanyId);

    expect(result).toEqual([mockApplications[1]]);
    expect(JobApplication.find).toHaveBeenCalled();
  });

  it('should return an empty array if no applications match the company', async () => {
    const mockCompanyId = new mongoose.Types.ObjectId();

    JobApplication.find.mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementationOnce((callback) => callback([])),
    });

    const result = await getCompanyJobApplications(mockCompanyId);

    expect(result).toEqual([]);
    expect(JobApplication.find).toHaveBeenCalled();
  });
});