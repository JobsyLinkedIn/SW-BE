import express from 'express';
import * as connections_controller from '../controllers/connections_controller.js';

const router = express.Router();

router.get('/search', connections_controller.search_user);

export default router;
