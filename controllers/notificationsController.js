import * as notificationServices from '../services/notificationServices.js';


export const createNotification = async (req, res) => {
  try {
    const notification = await notificationServices.createNotificationService(req.body, req.io); 
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await notificationServices.getUserNotificationsService(req.params.userId);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const markAsRead = async (req, res) => {
  try {
    const notification = await notificationServices.markAsReadService(req.params.userId);
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getUnseenCount = async (req, res) => {
  try {
    const count = await notificationServices.getUnseenCountService(req.params.userId);
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
