import express from 'express';
import { createServer } from 'http';
import { setupSocketIO } from './socket';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import meetingRoutes from './routes/meeting.routes';
import { createChatRoutes } from './routes/chat.routes';
import documentRoutes from './routes/document.routes';
import taskRoutes from './routes/task.routes';
import schedulingRoutes from './routes/scheduling.routes';
import { globalLimiter } from './middlewares/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);

// Setup Socket.IO
const io = setupSocketIO(server);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orgs', orgRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/chat', createChatRoutes(io));
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/scheduling', schedulingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nexus API is running securely' });
});

server.listen(PORT, () => {
  console.log(`Server is running securely on port ${PORT}`);
});
