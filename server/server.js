import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import todoRoutes from './routes/todos.js';
import aiRoutes from './routes/ai.js';
import searchRoutes from './routes/search.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'AWS Bedrock TODO API',
    version: '1.0.0',
    endpoints: {
      todos: '/api/todos',
      ai: '/api/ai',
      search: '/api/search'
    }
  });
});

app.use('/api/todos', todoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
