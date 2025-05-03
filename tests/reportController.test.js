import * as reportController from '../controllers/reportController.js';
import * as reportServices from '../services/reportServices.js';

jest.mock('../services/reportServices.js');

const mockReq = (data = {}) => ({
  body: {},
  params: {},
  user: { _id: 'adminId123' },
  ...data,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Report Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reportContent', () => {
    it('should create a report and return 201', async () => {
      const req = mockReq({
        body: {
          type: 'post',
          targetId: 'abc123',
          reason: 'spam',
          details: 'spam post',
        },
        user: { _id: 'adminId123' },
      });
      const res = mockRes();

      const mockReport = { _id: 'r1', type: 'post' };
      reportServices.createReport.mockResolvedValue(mockReport);

      await reportController.reportContent(req, res);

      expect(reportServices.createReport).toHaveBeenCalledWith({
        ...req.body,
        reportedBy: 'adminId123',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Report submitted successfully',
        report: mockReport,
      });
    });

    it('should return 400 on error', async () => {
      const req = mockReq();
      const res = mockRes();
      reportServices.createReport.mockRejectedValue(new Error('Test error'));

      await reportController.reportContent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  const reportTypes = [
    { name: 'getPostReports', type: 'post' },
    { name: 'getCommentReports', type: 'comment' },
    { name: 'getUserReports', type: 'user' },
    { name: 'getJobReports', type: 'job' },
  ];

  reportTypes.forEach(({ name, type }) => {
    describe(name, () => {
      it(`should return ${type} reports`, async () => {
        const req = mockReq();
        const res = mockRes();
        const reports = [{ _id: '1', type }];
        reportServices.getReportsByType.mockResolvedValue(reports);

        await reportController[name](req, res);

        expect(reportServices.getReportsByType).toHaveBeenCalledWith(type);
        expect(res.json).toHaveBeenCalledWith(reports);
      });

      it('should return 500 on error', async () => {
        const req = mockReq();
        const res = mockRes();
        reportServices.getReportsByType.mockRejectedValue(new Error('Server error'));

        await reportController[name](req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
      });
    });
  });

  describe('fetchReportById', () => {
    it('should return the report', async () => {
      const req = mockReq({ params: { id: 'r1' } });
      const res = mockRes();
      const report = { _id: 'r1', type: 'comment' };

      reportServices.getReportById.mockResolvedValue(report);

      await reportController.fetchReportById(req, res);

      expect(reportServices.getReportById).toHaveBeenCalledWith('r1');
      expect(res.json).toHaveBeenCalledWith(report);
    });

    it('should return 404 on error', async () => {
      const req = mockReq({ params: { id: 'badId' } });
      const res = mockRes();

      reportServices.getReportById.mockRejectedValue(new Error('Not found'));

      await reportController.fetchReportById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });
  });

  describe('handleReportStatus', () => {
    it('should update the report and return response', async () => {
      const req = mockReq({
        params: { id: 'r1' },
        body: { status: 'approved', actionTaken: '' },
      });
      const res = mockRes();

      const result = { message: 'Report accepted and necessary actions taken.' };

      reportServices.updateReportStatus.mockResolvedValue(result);

      await reportController.handleReportStatus(req, res);

      expect(reportServices.updateReportStatus).toHaveBeenCalledWith('r1', 'approved', '');
      expect(res.json).toHaveBeenCalledWith({ message: 'Report updated', report: result });
    });

    it('should return 400 on error', async () => {
      const req = mockReq({ params: { id: 'bad' }, body: { status: 'invalid' } });
      const res = mockRes();

      reportServices.updateReportStatus.mockRejectedValue(new Error('Invalid status'));

      await reportController.handleReportStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid status' });
    });
  });
});
