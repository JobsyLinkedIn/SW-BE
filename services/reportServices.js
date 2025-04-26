import Report from '../models/report.js';
import { postModel as Post }  from '../models/post.js';
import User from '../models/user.js';

export const createReport = async ({ type, targetId, reason, details, reportedBy }) => {
  const report = new Report({ type, targetId, reason, details, reportedBy });
  await report.save();
  return report;
};

export const getReportsByType = async (type) => {
  return await Report.find({ type })
    .populate('reportedBy', 'name email')
    .sort({ createdAt: -1 });
};

export const getReportById = async (id) => {
  const report = await Report.findById(id).populate('reportedBy', 'name email');
  if (!report) throw new Error('Report not found');
  return report;
};

export const updateReportStatus = async (id, status, actionTaken = '') => {
  const report = await Report.findById(id);
  if (!report) throw new Error('Report not found');

  if (status === 'approved') {
    if (report.type === 'post') {
      await Post.findByIdAndDelete(report.targetId);
    }
    if (report.type === 'user') {
      await User.findByIdAndDelete(report.targetId);
    }
    await Report.findByIdAndDelete(id);
    return { message: 'Report accepted and necessary actions taken.' };
  } else if (status === 'ignored') {
    report.status = 'ignored';
    report.actionTaken = actionTaken || 'No action needed';
    await Report.findByIdAndDelete(id);
    await report.save();
    return report;
  } else {
    throw new Error('Invalid status. Status must be approved or ignored.');
  }
  
};

