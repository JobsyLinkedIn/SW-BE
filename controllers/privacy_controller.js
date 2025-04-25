import canSendConnectionRequest from '../services/privacy/connection_privacy_service.js'
import reportPost from '../services/privacy/report_post_service.js';
import reportUser from '../services/privacy/report_user_service.js';
export const sendConnectionRequestController = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { targetUserId } = req.body;

    const allowed = await canSendConnectionRequest(senderId, targetUserId);

    if (!allowed) {
      return res.status(403).json({ message: 'You are not allowed to send a connection request to this user.' });
    }

    return res.status(200).json({ message: 'Connection request sent' });

  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};
export const reportUserController = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const targetUserId = req.params.targetUserId;
    // console.log("nfham",targetUserId);
    const { reason } = req.body;

    await reportUser(reporterId, targetUserId, reason);

    res.status(200).json({ message: 'User reported' });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
};
export const reportPostController = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const postId = req.params.postId;
    const { reason } = req.body;

    await reportPost(reporterId, postId, reason);

    res.status(200).json({ message: 'Post reported successfully' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};
