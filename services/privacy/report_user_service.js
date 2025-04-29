import User from '../../models/user.js';
import UserDetails from '../../models/user_details.js';
import { createReport } from '../reportServices.js'; // adjust path as needed

const allowedReasons = ['spam', 'harassment', 'inappropriate content', 'fake-account', 'other'];

const reportUser = async (reporterId, targetUserId, reason) => {
  const reporter = await User.findById(reporterId);
  const targetUser = await User.findById(targetUserId);

  if (!reporter) {
    const error = new Error('Reporter user not found');
    error.statusCode = 404;
    throw error;
  }

  if (!targetUser) {
    const error = new Error('Target user not found');
    error.statusCode = 404;
    throw error;
  }

  if (!allowedReasons.includes(reason)) {
    const error = new Error('Invalid report reason');
    error.statusCode = 400;
    throw error;
  }

  const targetDetails = await UserDetails.findOne({ user: targetUserId });
  if (!targetDetails) {
    const error = new Error('Target user details not found');
    error.statusCode = 404;
    throw error;
  }

  const alreadyReported = targetDetails.reportedBy.find(
    (entry) => entry.reporterId.toString() === reporterId.toString()
  );

  if (alreadyReported) {
    const error = new Error('You have already reported this user');
    error.statusCode = 409;
    throw error;
  }

  targetDetails.reportedBy.push({
    reporterId,
    reason,
    reportedAt: new Date(),
  });

  await targetDetails.save();

  await createReport({
    type: 'user',
    targetId: targetUserId,
    reason,
    details: '',
    reportedBy: reporterId,
  });

  return true;
};

export default reportUser;
