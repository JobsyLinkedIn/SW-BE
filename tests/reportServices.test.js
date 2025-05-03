import * as reportServices from '../services/reportServices.js';
import Report from '../models/report.js';
import User from '../models/user.js';
import { postModel as Post } from '../models/post.js';

jest.mock('../models/report.js');
jest.mock('../models/user.js');
jest.mock('../models/post.js');

describe('Report Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReport', () => {
    it('should create and return a new report', async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const mockReport = {
        type: 'post',
        targetId: '123',
        reason: 'Inappropriate content',
        details: 'Detailed explanation',
        reportedBy: 'user123',
        save: saveMock,
      };

      Report.mockImplementation(() => mockReport);

      const result = await reportServices.createReport(mockReport);

      expect(saveMock).toHaveBeenCalled();
      expect(result.type).toBe('post');
      expect(result.reason).toBe('Inappropriate content');
    });
  });

  describe('getReportsByType', () => {
    it('should return reports of a specific type', async () => {
      const mockReports = [{ _id: 'r1', type: 'user' }, { _id: 'r2', type: 'user' }];

      Report.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockReports),
      });

      const result = await reportServices.getReportsByType('user');
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('user');
    });
  });

  describe('getReportById', () => {
    it('should return report if found', async () => {
      const mockReport = { _id: 'r123', type: 'comment' };

      Report.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockReport),
      });

      const result = await reportServices.getReportById('r123');
      expect(result._id).toBe('r123');
    });

    it('should throw error if report not found', async () => {
      Report.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(reportServices.getReportById('badid')).rejects.toThrow('Report not found');
    });
  });

  describe('updateReportStatus', () => {
    it('should approve and delete post and report', async () => {
      const mockReport = { _id: 'r1', type: 'post', targetId: 'p123' };

      Report.findById.mockResolvedValue(mockReport);
      Post.findByIdAndDelete.mockResolvedValue(true);
      Report.findByIdAndDelete.mockResolvedValue(true);

      const result = await reportServices.updateReportStatus('r1', 'approved');

      expect(Post.findByIdAndDelete).toHaveBeenCalledWith('p123');
      expect(Report.findByIdAndDelete).toHaveBeenCalledWith('r1');
      expect(result.message).toBe('Report accepted and necessary actions taken.');
    });

    it('should approve and delete user and report', async () => {
      const mockReport = { _id: 'r2', type: 'user', targetId: 'u123' };

      Report.findById.mockResolvedValue(mockReport);
      User.findByIdAndDelete.mockResolvedValue(true);
      Report.findByIdAndDelete.mockResolvedValue(true);

      const result = await reportServices.updateReportStatus('r2', 'approved');

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('u123');
      expect(Report.findByIdAndDelete).toHaveBeenCalledWith('r2');
      expect(result.message).toBe('Report accepted and necessary actions taken.');
    });

    it('should ignore report and update status', async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const mockReport = {
        _id: 'r3',
        type: 'job',
        status: 'pending',
        actionTaken: '',
        save: saveMock,
      };

      Report.findById.mockResolvedValue(mockReport);
      Report.findByIdAndDelete.mockResolvedValue(true);

      const result = await reportServices.updateReportStatus('r3', 'ignored', 'Not a violation');

      expect(mockReport.status).toBe('ignored');
      expect(mockReport.actionTaken).toBe('Not a violation');
      expect(saveMock).toHaveBeenCalled();
      expect(result.status).toBe('ignored');
    });

    it('should throw error for invalid status', async () => {
      const mockReport = { _id: 'r4', type: 'post', targetId: 'p123' };
      Report.findById.mockResolvedValue(mockReport);

      await expect(
        reportServices.updateReportStatus('r4', 'pending')
      ).rejects.toThrow('Invalid status. Status must be approved or ignored.');
    });

    it('should throw error if report not found', async () => {
      Report.findById.mockResolvedValue(null);

      await expect(reportServices.updateReportStatus('invalid', 'approved')).rejects.toThrow(
        'Report not found'
      );
    });
  });
});
