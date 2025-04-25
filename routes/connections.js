import express from 'express';
import * as connections_controller from '../controllers/connections_controller.js';
import authenticateUser from '../middlewares/authenticateUser.js';

const router = express.Router();
// router.get('/search',authenticateUser ,connections_controller.search_user);

router.get('/search', connections_controller.search_user);
router.post('/send', authenticateUser, connections_controller.send_connection_request);
router.patch('/handle',authenticateUser,connections_controller.accept_decline);
router.delete('/remove', authenticateUser,connections_controller.remove_connection);
router.post('/follow', authenticateUser,connections_controller.follow_target);
router.delete('/unfollow',authenticateUser, connections_controller.unfollow_target);
router.get('/connections', authenticateUser,connections_controller.get_connections);
router.get('/pending', authenticateUser,connections_controller.get_pending_requests);
router.post('/block', authenticateUser,connections_controller.block_user);
router.get('/block/:id', authenticateUser,connections_controller.get_list_blocked);

router.post('/unblock', authenticateUser,connections_controller.unblock_user);
router.post('/message', authenticateUser,connections_controller.sendMessageRequest);
router.get('/getRequest/:id',authenticateUser,connections_controller.getAllMessageRequests);
export default router;
