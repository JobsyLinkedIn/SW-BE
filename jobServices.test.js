import Job from './models/jobs.js';
import User from './models/user.js';
import Company from './models/company.js';
import Report from './models/report.js';
import * as jobServices from './services/jobServices.js';
import { startConversationWithFirstMessage } from './services/messagesServices.js';

jest.mock('./models/jobs.js');
jest.mock('./models/user.js');
jest.mock('./models/company.js');
jest.mock('./models/report.js');
jest.mock('./services/messagesServices.js');

describe('Job Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
    });
  });

  describe('createJobService', () => {
    it('should create a job successfully', async () => {
      const jobData = { title: 'Software Engineer', description: 'Job description' };
      const userId = 'user123';
      Company.findOne.mockResolvedValue({ _id: 'company123' });
      Job.prototype.save = jest.fn().mockResolvedValue();
      Company.prototype.save = jest.fn().mockResolvedValue();

      const result = await jobServices.createJobService(jobData, userId);

      expect(Job.prototype.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(jobData));
    });

    it('should create a job without a company', async () => {
      const jobData = { title: 'Software Engineer', description: 'Job description' };
      const userId = 'user123';
      Company.findOne.mockResolvedValue(null);
      Job.prototype.save = jest.fn().mockResolvedValue();

      const result = await jobServices.createJobService(jobData, userId);

      expect(Job.prototype.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(jobData));
    });
  });

  describe('applyForJobService', () => {
    it('should apply for a job successfully', async () => {
      const req = {
        user: { _id: 'user123' },
        params: { jobId: 'job123' },
        mediaFilesData: [{ secure_url: 'resume_url' }, { secure_url: 'cover_letter_url' }],
      };
      const job = { applications: [], save: jest.fn() };
      const user = { appliedJobs: [], save: jest.fn() };

      Job.findById.mockResolvedValue(job);
      User.findById.mockResolvedValue(user);

      const result = await jobServices.applyForJobService(req);

      expect(job.save).toHaveBeenCalled();
      expect(user.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Job application submitted successfully' });
    });

    it('should throw an error if the job ID is invalid', async () => {
      const req = {
        user: { _id: 'user123' },
        params: { jobId: 'invalid' },
      };

      await expect(jobServices.applyForJobService(req)).rejects.toThrow('Invalid Job ID');
    });
  });

  describe('contactCandidateService', () => {
    it('should contact a candidate successfully', async () => {
      const req = {
        user: { _id: 'user123' },
        params: { jobId: 'job123', candidateId: 'candidate123' },
        body: { message: 'Hello' },
      };
      const job = {
        postedBy: 'user123',
        applications: [{ applicant: 'candidate123' }],
      };

      Job.findById.mockResolvedValue(job);
      startConversationWithFirstMessage.mockResolvedValue({ conversationId: 'conv123' });

      const result = await jobServices.contactCandidateService(req);

      expect(result).toEqual({
        message: 'Message sent to candidate: Hello',
        conversation: { conversationId: 'conv123' },
      });
    });

    it('should throw an error if the job is not found', async () => {
      const req = {
        user: { _id: 'user123' },
        params: { jobId: 'job123', candidateId: 'candidate123' },
        body: { message: 'Hello' },
      };

      Job.findById.mockResolvedValue(null);

      await expect(jobServices.contactCandidateService(req)).rejects.toThrow('Job not found');
    });
  });

  describe('reportJobService', () => {
    it('should report a job successfully', async () => {
      const userId = 'user123';
      const jobId = 'job123';
      const reason = 'Spam';
      const details = 'Job posting is spam';
      const job = {};

      Job.findById.mockResolvedValue(job);
      Report.prototype.save = jest.fn().mockResolvedValue();

      const result = await jobServices.reportJobService(userId, jobId, reason, details);

      expect(Report.prototype.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Job reported successfully' });
    });

    it('should throw an error if the job is not found', async () => {
      const userId = 'user123';
      const jobId = 'job123';
      const reason = 'Spam';
      const details = 'Job posting is spam';

      Job.findById.mockResolvedValue(null);

      await expect(jobServices.reportJobService(userId, jobId, reason, details)).rejects.toThrow(
        'Job not found'
      );
    });
  });

  describe('updateApplicationStatusService', () => {
    it('should update the application status successfully', async () => {
      const userId = 'user123';
      const jobId = 'job123';
      const applicantId = 'applicant123';
      const status = 'approved';
      const job = {
        postedBy: 'user123',
        applications: [{ applicant: 'applicant123', status: 'pending' }],
        save: jest.fn(),
      };

      Job.findById.mockResolvedValue(job);

      const result = await jobServices.updateApplicationStatusService(
        userId,
        jobId,
        applicantId,
        status
      );

      expect(job.save).toHaveBeenCalled();
      expect(result).toEqual({ message: `Application status updated to ${status}` });
    });

    it('should throw an error if the job is not found', async () => {
      const userId = 'user123';
      const jobId = 'job123';
      const applicantId = 'applicant123';
      const status = 'approved';

      Job.findById.mockResolvedValue(null);

      await expect(
        jobServices.updateApplicationStatusService(userId, jobId, applicantId, status)
      ).rejects.toThrow('Job not found');
    });
  });

  describe('deleteJobService', () => {
    it('should delete a job successfully', async () => {
      const userId = 'user123';
      const jobId = 'job123';
      const job = { postedBy: 'user123' };

      Job.findById.mockResolvedValue(job);
      Job.findByIdAndDelete.mockResolvedValue();

      const result = await jobServices.deleteJobService(userId, jobId);

      expect(Job.findByIdAndDelete).toHaveBeenCalledWith(jobId);
      expect(result).toEqual({ message: 'Job deleted successfully' });
    });

    it('should throw an error if the job is not found', async () => {
      const userId = 'user123';
      const jobId = 'job123';

      Job.findById.mockResolvedValue(null);

      await expect(jobServices.deleteJobService(userId, jobId)).rejects.toThrow('Job not found');
    });
  });

describe('getApplicationStatusService', () => {
  it('should return the application status successfully', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };
    const job = {
      applications: [{ applicant: 'user123', status: 'approved' }],
    };

    Job.findById.mockResolvedValue(job);

    const result = await jobServices.getApplicationStatusService(req);

    expect(result).toBe('approved');
  });

  it('should throw an error if the job is not found', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };

    Job.findById.mockResolvedValue(null);

    await expect(jobServices.getApplicationStatusService(req)).rejects.toThrow('Job not found');
  });

  it('should throw an error if no application is found for the user', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };
    const job = {
      applications: [],
    };

    Job.findById.mockResolvedValue(job);

    await expect(jobServices.getApplicationStatusService(req)).rejects.toThrow(
      'No application found for this job'
    );
  });
});

describe('saveJobForLaterService', () => {
  it('should save a job for later successfully', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };
    const user = { savedJobs: [], save: jest.fn() };
    const job = { savedBy: [], save: jest.fn() };

    User.findById.mockResolvedValue(user);
    Job.findById.mockResolvedValue(job);

    const result = await jobServices.saveJobForLaterService(req);

    expect(user.save).toHaveBeenCalled();
    expect(job.save).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Job saved successfully' });
  });

  it('should throw an error if the job is not found', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };

    Job.findById.mockResolvedValue(null);

    await expect(jobServices.saveJobForLaterService(req)).rejects.toThrow('Job not found');
  });

  it('should throw an error if the user is not found', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };

    User.findById.mockResolvedValue(null);

    await expect(jobServices.saveJobForLaterService(req)).rejects.toThrow('User not found');
  });
});

describe('getSavedJobsService', () => {
  it('should return saved jobs successfully', async () => {
    const req = {
      user: { _id: 'user123' },
    };
    const user = {
      savedJobs: [{ title: 'Software Engineer' }],
      populate: jest.fn().mockResolvedValue([{ title: 'Software Engineer' }]),
    };

    User.findById.mockResolvedValue(user);

    const result = await jobServices.getSavedJobsService(req);

    expect(result).toEqual([{ title: 'Software Engineer' }]);
  });

  it('should throw an error if no saved jobs are found', async () => {
    const req = {
      user: { _id: 'user123' },
    };
    const user = {
      savedJobs: [],
      populate: jest.fn().mockResolvedValue([]),
    };

    User.findById.mockResolvedValue(user);

    await expect(jobServices.getSavedJobsService(req)).rejects.toThrow('No saved jobs found');
  });

  it('should throw an error if the user is not found', async () => {
    const req = {
      user: { _id: 'user123' },
    };

    User.findById.mockResolvedValue(null);

    await expect(jobServices.getSavedJobsService(req)).rejects.toThrow('User not found');
  });
});

describe('reviewApplicationsService', () => {
  it('should return job applications successfully', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };
    const job = {
      postedBy: 'user123',
      applications: [{ applicant: { name: 'John Doe', email: 'john@example.com' } }],
    };

    Job.findById.mockResolvedValue(job);

    const result = await jobServices.reviewApplicationsService(req);

    expect(result).toEqual(job.applications);
  });

  it('should throw an error if the job is not found', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };

    Job.findById.mockResolvedValue(null);

    await expect(jobServices.reviewApplicationsService(req)).rejects.toThrow('Job not found');
  });

  it('should throw an error if the user is not authorized', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };
    const job = {
      postedBy: 'anotherUser',
    };

    Job.findById.mockResolvedValue(job);

    await expect(jobServices.reviewApplicationsService(req)).rejects.toThrow('User not authorized');
  });

describe('getApplicationStatusService', () => {
  it('should return the application status successfully', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };
    const job = {
      applications: [{ applicant: 'user123', status: 'approved' }],
    };

    Job.findById.mockResolvedValue(job);

    const result = await jobServices.getApplicationStatusService(req);

    expect(result).toBe('approved');
  });

  it('should throw an error if the job is not found', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };

    Job.findById.mockResolvedValue(null);

    await expect(jobServices.getApplicationStatusService(req)).rejects.toThrow('Job not found');
  });

  it('should throw an error if no application is found for the user', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };
    const job = {
      applications: [],
    };

    Job.findById.mockResolvedValue(job);

    await expect(jobServices.getApplicationStatusService(req)).rejects.toThrow(
      'No application found for this job'
    );
  });
});

describe('saveJobForLaterService', () => {
  it('should save a job for later successfully', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };
    const user = { savedJobs: [], save: jest.fn() };
    const job = { savedBy: [], save: jest.fn() };

    User.findById.mockResolvedValue(user);
    Job.findById.mockResolvedValue(job);

    const result = await jobServices.saveJobForLaterService(req);

    expect(user.save).toHaveBeenCalled();
    expect(job.save).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Job saved successfully' });
  });

  it('should throw an error if the job is not found', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };

    Job.findById.mockResolvedValue(null);

    await expect(jobServices.saveJobForLaterService(req)).rejects.toThrow('Job not found');
  });

  it('should throw an error if the user is not found', async () => {
    const req = {
      user: { _id: 'user123' },
      params: { jobId: 'job123' },
    };

    User.findById.mockResolvedValue(null);

    await expect(jobServices.saveJobForLaterService(req)).rejects.toThrow('User not found');
  });
});

describe('getSavedJobsService', () => {
  it('should return saved jobs successfully', async () => {
    const req = {
      user: { _id: 'user123' },
    };
    const user = {
      savedJobs: [{ title: 'Software Engineer' }],
      populate: jest.fn().mockResolvedValue([{ title: 'Software Engineer' }]),
    };

    User.findById.mockResolvedValue(user);

    const result = await jobServices.getSavedJobsService(req);

    expect(result).toEqual([{ title: 'Software Engineer' }]);
  });

  it('should throw an error if no saved jobs are found', async () => {
    const req = {
      user: { _id: 'user123' },
    };
    const user = {
      savedJobs: [],
      populate: jest.fn().mockResolvedValue([]),
    };

    User.findById.mockResolvedValue(user);

    await expect(jobServices.getSavedJobsService(req)).rejects.toThrow('No saved jobs found');
  });

  it('should throw an error if the user is not found', async () => {
    const req = {
      user: { _id: 'user123' },
    };

    User.findById.mockResolvedValue(null);

    await expect(jobServices.getSavedJobsService(req)).rejects.toThrow('User not found');
  });
});
});
