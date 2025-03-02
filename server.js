import 'dotenv/config';
import express from 'express';
import routes from './routes/temp.js';
import connectDB from './db.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', routes);

connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
