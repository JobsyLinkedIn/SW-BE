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
<<<<<<< HEAD
import stripePaymentRoutes from './routes/stripePayment/stripePaymentRouter.js';

=======
import NotificationRoutes from './routes/notification.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import companyRoutes from './routes/company.js';
import privacyRoutes from './routes/privacy.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/report.js';
>>>>>>> 55bb97b51abfaaa360620edc3a4c323775722ca0
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app); 
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', 
  },
});


app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(' A user connected: ' + socket.id);

  socket.on('join', (userId) => {
    socket.join(userId); 
  });

  socket.on('disconnect', () => {
    console.log(' User disconnected: ' + socket.id);
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
<<<<<<< HEAD
app.use('/api/subscription-plan', subscriptionPlanRoutes);
app.use('/api/subscription-plan-payment', stripePaymentRoutes);
=======
app.use('/api/notifications', NotificationRoutes); //Notifications Route
app.use('/api',companyRoutes);
app.use('/api/privacy',privacyRoutes);
app.use('/api/admin',adminRoutes); // Connection routes
app.use('/api/report', reportRoutes); // Report routes


>>>>>>> 55bb97b51abfaaa360620edc3a4c323775722ca0

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
