// --- 1. Import dependencies and setup server ---
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
import commentsRoutes from './routes/commentsRoutes.js';

// Create Express app and HTTP server
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

// Initialize conversations typing status
const conversationsTypingStatus = {}; // Structure: { "conv1": { "user1": true, "user2": false }, ... }

// Weekly cleanup of empty conversations
setInterval(() => {
  for (const convId in conversationsTypingStatus) {
    if (Object.keys(conversationsTypingStatus[convId]).length === 0) {
      delete conversationsTypingStatus[convId];
    }
  }
}, 3 * 60 * 60 * 1000); // Every 3 hours

// Socket.IO middleware for authentication
io.use(authenticateSocket);

// Attach io to req object for use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  const userId = socket.request.user?.userId;
  if (userId) {
    console.log('User ID:', userId);
    socket.join(userId);
  }

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('joinConversation', (conversationId) => {
    handleJoinConversation(socket, conversationId);
  });

  socket.on('leaveConversation', (conversationId) => {
    handleleaveConversation(socket, conversationId);
  });

  socket.on('sendMessage', async (messageData) => {
    await handleSendMessage(socket, io, messageData);
  });

  socket.on('typing', async ({ conversationId, isTyping }) => {
    await handleTypingStatus(socket, io, conversationsTypingStatus, { conversationId, isTyping });
  });

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
app.use('/api/posts', postRoutes); // Posts Routes
app.use('/api/user/actions', userActionsRoutes); // User Actions Route
app.use('/api/users', connectionRoutes);
app.use('/api/subscription-plan', subscriptionPlanRoutes);
app.use('/api/subscription-plan-payment', stripePaymentRoutes);
app.use('/api/notifications', NotificationRoutes); // Notifications Route
app.use('/api', companyRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/report', reportRoutes); // Report routes
app.use('/api/jobs', jobroutes); // Job routes
app.use('/api/messages', messagesRoutes); // Messages routes
app.use('/api/conversation', conversationRoutes); // Conversation routes
app.use('/api/comments', commentsRoutes); // Comments routes

// Error handler - must be last
app.use(errorHandler);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});