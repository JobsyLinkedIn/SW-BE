import search_user_service from '../services/connections/search_service.js';
import send_connection_request_service from '../services/connections/send_connection_service.js';
import accept_decline_connection_service from '../services/connections/accept_decline_connection_service.js';
import remove_connection_service from '../services/connections/remove_connection_service.js';
import follow_target_service from '../services/connections/follow_service.js'
import unfollow_target_service from '../services/connections/unfollow_service.js';
import get_connections_service from '../services/connections/get_list_of_connections_service.js';
import get_pending_requests_service from '../services/connections/get_list_of_pending_connections_service.js';
import blockUser from '../services/connections/block_user_service.js';
import unblockUser from '../services/connections/unblock_user_service.js';
import createMessageRequest from '../services/connections/message_request_for_nonconnections_service.js';
import get_message_requests from '../services/connections/get_all_message_request_service.js';
import getBlockedUsers from '../services/connections/get_blocked_list_service.js';
import acceptMessageRequest from '../services/connections/accept_message_request_service.js';
import declineMessageRequest from '../services/connections/decline_message_request_service.js';

export const search_user = async (req, res) => {
  try {
    const { name, company, industry } = req.query;
    const users = await search_user_service(name, company, industry);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: 'Error while searching for users',
      error: error.message,
    });
  }
};
export const send_connection_request = async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    const result = await send_connection_request_service(sender, receiver);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error while sending requests', error: error.message });
  }
};
export const accept_decline = async (req, res) => {
  try {
    const { sender, receiver, action } = req.body;
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "decline".' });
    }
    const result = await accept_decline_connection_service(sender, receiver, action);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error while processing request',
      error: error.message,
    });
  }
};
export const remove_connection = async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    const result = await remove_connection_service(sender, receiver);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error while removing connection', error: error.message });
  }
};
export const follow_target = async (req, res) => {
  try {
    const { follower, targetId, targetType } = req.body; // targetType should be 'user' or 'company'
    const result = await follow_target_service(follower, targetId, targetType);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error while following', error: error.message });
  }
};
export const unfollow_target = async (req, res) => {
  try {
    const { follower, targetId, targetType } = req.body;
    const result = await unfollow_target_service(follower, targetId, targetType);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error while unfollowing target', error: error.message });
  }
};
export const get_connections = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await get_connections_service(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching connections', error: error.message });
  }
};
export const get_pending_requests = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await get_pending_requests_service(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
};

export const block_user = async (req, res) => {
  const { userId, targetUserId } = req.body;
  try {
    await blockUser(userId, targetUserId);
    res.status(200).json({ message: 'User blocked successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error blocking user.', error: err.message });
  }
};

export const unblock_user = async (req, res) => {
  const { userId, targetUserId } = req.body;

  try {
    await unblockUser(userId, targetUserId);
    res.status(200).json({ message: 'User unblocked successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error unblocking user.', error: err.message });
  }
};

export const sendMessageRequest = async (req, res) => {
  try {
    const { from, to, content } = req.body;
    const newRequest = await createMessageRequest(from, to, content);
    res.status(201).json({ message: 'Message request sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating message request:', error: err.message });
  }
};

export const getAllMessageRequests = async (req, res) => {
  const userId = req.params.id;
  try {
    const messageRequests = await get_message_requests(userId);
    res.status(200).json(messageRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const get_list_blocked = async (req, res) => {
  try {
      const userId = req.user._id;
      // console.log("debug",userId);

      const blockedUsers = await getBlockedUsers(userId); 

      res.status(200).json(blockedUsers);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


export const handleAcceptMessageRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const currentUserId = req.user.id;

    const connection = await acceptMessageRequest(requestId, currentUserId);
    res.status(200).json({
      message: 'Message request accepted.',
      connection
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



export const declineRequestController = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id; 

  try {
    const result = await declineMessageRequest(id, currentUserId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: 'Error while declining the message request',
      error: error.message,
    });
  }
};

