import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth.js'; // Import authentication routes
import profileRoutes from './routes/profileRoutes.js'; // Import profile routes
import postRoutes from './routes/postRoutes.js'; // Import post routes
import errorHandler from './middlewares/errorHandler.js';
import userActionsRoutes from './routes/userActionsRoutes.js';
import connectionRoutes from './routes/connections.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger_output.json' with { type: 'json' };

const app = express();
const PORT = process.env.PORT || 3000;

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
