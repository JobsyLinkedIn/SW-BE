import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profileRoutes.js'; // Import profile routes
import postRoutes from './routes/postRoutes.js'; // Import post routes
import errorHandler from './middlewares/errorHandler.js';
import userActionsRoutes from './routes/userActionsRoutes.js';
import connectionRoutes from './routes/connections.js';
import subscriptionPlanRoutes from './routes/subscriptionPlanRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger_output.json' with { type: 'json' };
import stripePaymentRoutes from './routes/stripePayment/stripePaymentRouter.js';

import NotificationRoutes from './routes/notification.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import companyRoutes from './routes/company.js';
import privacyRoutes from './routes/privacy.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/report.js';
import jobroutes from './routes/jobRoutes.js';
import { authenticateSocket } from './middlewares/authenticateSocket.js';
import {
  handleJoinConversation,
  handleleaveConversation,
  handleSendMessage,
  handleTypingStatus,
  handleMarkAsRead,
} from './sockets/socketEventsHandlers.js';
import messagesRoutes from './routes/messagesRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import e from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

// Initialize  conversationsTypingStatus with cleanup interval
const conversationsTypingStatus = {}; // Structure: { "conv1": { "user1": true, "user2": false }, ... }
setInterval(
  () => {
    // Clean up empty conversations weekly
    for (const convId in conversationsTypingStatus) {
      if (Object.keys(conversationsTypingStatus[convId]).length === 0) {
        delete conversationsTypingStatus[convId];
      }
    }
  },
  3 * 60 * 60 * 1000
); // Weekly cleanup

// Socket.IO middleware for authentication
//Ensures only authenticated users can establish WebSocket connections
io.use(authenticateSocket);

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(' A user connected: ' + socket.id);
  console.log(' A user connected: ' + socket.request.user.userId);
  socket.join(socket.request.user.userId);
  // Join a room named with their user ID
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log(' User disconnected: ' + socket.id);
  });

  // Join a conversation
  socket.on('joinConversation', (conversationId) => {
    handleJoinConversation(socket, conversationId);
  });

  // Leave a conversation
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Send Message
  socket.on('sendMessage', async (messageData) => {
    await handleSendMessage(socket, io, messageData);
  });
  // Handle typing indicator
  socket.on('typing', async ({ conversationId, isTyping }) => {
    await handleTypingStatus(socket, io, conversationsTypingStatus, { conversationId, isTyping });
  });

  // Handle read receipts
  socket.on('markAsRead', async (messageIds) => {
    await handleMarkAsRead(socket, io, messageIds);
  });
  socket.on('auth_error', (message) => {
    console.error(message);
  });
});

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for frontend requests
// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/user/profile', profileRoutes); // Profile routes
app.use('/api/posts', postRoutes); //Posts Routes
app.use('/api/user/actions', userActionsRoutes); //User Actions Route
app.use('/api/users', connectionRoutes);
app.use('/api/subscription-plan', subscriptionPlanRoutes);
app.use('/api/subscription-plan-payment', stripePaymentRoutes);
app.use('/api/notifications', NotificationRoutes); //Notifications Route
app.use('/api', companyRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/admin', adminRoutes); // Connection routes
app.use('/api/report', reportRoutes); // Report routes
app.use('/api/jobs', jobroutes); // Job routes
app.use('/api/messages', messagesRoutes);
app.use('/api/conversation', conversationRoutes);

// 🔴 Place this at the end (AFTER routes)
app.use(errorHandler);

/*
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
*/
// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
