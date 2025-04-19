import * as notificationServices from '../services/notificationServices.js';

export const createNotification = async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const data = { ...req.body, fromUserId };

    const notification = await notificationServices.createNotificationService(data, req.io);
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }

    const notifications = await notificationServices.getUserNotificationsService(req.params.userId);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await notificationServices.getNotificationByIdService(notificationId);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to mark this notification as read." });
    }

    const updated = await notificationServices.markAsReadService(notificationId);
    res.status(200).json({ success: true, notification: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUnseenCount = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }

    const count = await notificationServices.getUnseenCountService(req.params.userId);
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};