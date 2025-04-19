import { notifications } from '../models/notifications.js';

export const createNotificationService = async (data,io) => {
  const { userId, fromUserId, type, content, postId, redirectUrl } = data;

  if (!userId || !fromUserId) {
    throw new Error('Both userId (receiver) and fromUserId (sender) must be provided');
  }

  if (!content && !postId) {
    throw new Error('Notification must have content or a related postId');
  }

  const validTypes = ['like', 'comment', 'message'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid notification type. Valid types are: ${validTypes.join(', ')}`);
  }

  const notification = new notifications({
    userId,
    fromUserId,
    type,
    content,
    postId,
    redirectUrl,
  });

  const savednot= await notification.save();
  if (io && data.userId) {
    io.to(data.userId.toString()).emit('new-notification', savednot);
  }

  return savednot;
};
  

export const getUserNotificationsService = async (userId) => {
  return await notifications.find({ userId }).sort({ createdAt: -1 });
};

export const markAsReadService = async (notificationId) => {
  return await notifications.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
};

export const getUnseenCountService = async (userId) => {
  const count = await notifications.countDocuments({ userId, isRead: false });
  return count;
};