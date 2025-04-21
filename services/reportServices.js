import Report from '../models/report.js';

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
  const updated = await Report.findByIdAndUpdate(
    id,
    { status, actionTaken },
    { new: true }
  );
  if (!updated) throw new Error('Report not found');
  return updated;
};
