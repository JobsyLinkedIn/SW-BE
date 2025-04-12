import express from 'express';
import * as connections_controller from '../controllers/connections_controller.js';
import authenticateUser from '../middlewares/authenticateUser.js';

const router = express.Router();
// router.get('/search',authenticateUser ,connections_controller.search_user);

router.get('/search', connections_controller.search_user);
router.post('/send', connections_controller.send_connection_request);
router.patch('/handle', connections_controller.accept_decline);
router.delete('/remove', connections_controller.remove_connection);
router.post('/follow', connections_controller.follow_user);
router.delete('/unfollow', connections_controller.unfollow_user);
router.get('/connections', connections_controller.get_connections);
router.get('/pending', connections_controller.get_pending_requests);
router.post('/block', connections_controller.block_user);
router.post('/unblock', connections_controller.unblock_user);
router.post('/message', connections_controller.sendMessageRequest);
export default router;
