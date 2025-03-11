import cors from 'cors';
import express from 'express';
import userRoutes from '../routes/userRoutes';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

app.use('/api', userRoutes);

app.listen(1909, () => console.log('🚀 Server running on port 1909'));

export default app;
