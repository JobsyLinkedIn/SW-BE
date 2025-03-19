import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth.js'; // Import authentication routes
import profileRoutes from './routes/profileRoutes.js'; // Import profile routes
import postRoutes from './routes/postRoutes.js'; // Import post routes

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
app.use('/api/posts', postRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));