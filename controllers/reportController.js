import {
    createReport,
    getReportsByType,
    getReportById,
    updateReportStatus,
  } from '../services/reportServices.js';
  
  export const reportContent = async (req, res) => {
    try {
      const { type, targetId, reason, details } = req.body;
      const reportedBy = req.user._id;
  
      const report = await createReport({ type, targetId, reason, details, reportedBy });
  
      res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  export const getPostReports = async (req, res) => {
    try {
      const reports = await getReportsByType('post');
      res.json(reports);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  export const getCommentReports = async (req, res) => {
    try {
      const reports = await getReportsByType('comment');
      res.json(reports);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  export const getUserReports = async (req, res) => {
    try {
      const reports = await getReportsByType('user');
      res.json(reports);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  export const getJobReports = async (req, res) => {
    try {
      const reports = await getReportsByType('job');
      res.json(reports);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  export const fetchReportById = async (req, res) => {
    try {
      const { id } = req.params;
      const report = await getReportById(id);
      res.json(report);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
  
  export const handleReportStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, actionTaken } = req.body;
  
      const updated = await updateReportStatus(id, status, actionTaken);
      res.json({ message: 'Report updated', report: updated });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  