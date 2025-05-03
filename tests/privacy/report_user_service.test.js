import reportUser from '../../services/privacy/report_user_service.js';
import User from '../../models/user.js';
import UserDetails from '../../models/user_details.js';
import { createReport } from '../../services/reportServices.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');
jest.mock('../../models/user_details.js');
jest.mock('../../services/reportServices.js');

describe('reportUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the reporter user is not found', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const targetUserId = new mongoose.Types.ObjectId();
    const reason = 'spam';

    User.findById.mockResolvedValueOnce(null);

    await expect(reportUser(reporterId, targetUserId, reason)).rejects.toThrow('Reporter user not found');
    expect(User.findById).toHaveBeenCalledWith(reporterId);
  });

  it('should throw an error if the target user is not found', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const targetUserId = new mongoose.Types.ObjectId();
    const reason = 'spam';

    User.findById.mockResolvedValueOnce({}).mockResolvedValueOnce(null);

    await expect(reportUser(reporterId, targetUserId, reason)).rejects.toThrow('Target user not found');
    expect(User.findById).toHaveBeenCalledWith(targetUserId);
  });

  it('should throw an error if the reason is invalid', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const targetUserId = new mongoose.Types.ObjectId();
    const reason = 'invalid-reason';

    User.findById.mockResolvedValueOnce({}).mockResolvedValueOnce({});

    await expect(reportUser(reporterId, targetUserId, reason)).rejects.toThrow('Invalid report reason');
  });

  it('should throw an error if target user details are not found', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const targetUserId = new mongoose.Types.ObjectId();
    const reason = 'spam';

    User.findById.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    UserDetails.findOne.mockResolvedValueOnce(null);

    await expect(reportUser(reporterId, targetUserId, reason)).rejects.toThrow('Target user details not found');
    expect(UserDetails.findOne).toHaveBeenCalledWith({ user: targetUserId });
  });

  it('should throw an error if the user is already reported by the reporter', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const targetUserId = new mongoose.Types.ObjectId();
    const reason = 'spam';

    const mockTargetDetails = {
      reportedBy: [{ reporterId }],
      save: jest.fn(),
    };

    User.findById.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    UserDetails.findOne.mockResolvedValueOnce(mockTargetDetails);

    await expect(reportUser(reporterId, targetUserId, reason)).rejects.toThrow('You have already reported this user');
  });

  it('should successfully report a user', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const targetUserId = new mongoose.Types.ObjectId();
    const reason = 'spam';

    const mockTargetDetails = {
      reportedBy: [],
      save: jest.fn().mockResolvedValueOnce(),
    };

    User.findById.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    UserDetails.findOne.mockResolvedValueOnce(mockTargetDetails);
    createReport.mockResolvedValueOnce();

    const result = await reportUser(reporterId, targetUserId, reason);

    expect(result).toBe(true);
    expect(mockTargetDetails.reportedBy).toHaveLength(1);
    expect(mockTargetDetails.reportedBy[0]).toMatchObject({ reporterId, reason });
    expect(mockTargetDetails.save).toHaveBeenCalled();
    expect(createReport).toHaveBeenCalledWith({
      type: 'user',
      targetId: targetUserId,
      reason,
      details: '',
      reportedBy: reporterId,
    });
  });
});