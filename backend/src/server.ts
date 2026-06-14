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
import uploadRoutes from './routes/upload.routes';
import videoRoutes from './routes/video.routes';
import { createVideoRoutes } from './routes/video.routes';
import searchRoutes from './routes/search.routes';
import aiRoutes from './routes/ai.routes';
import billingRoutes from './routes/billing.routes';
import deviceRoutes from './routes/device.routes';
import webhookRoutes from './routes/webhook.routes';
import adminRoutes from './routes/admin.routes';
import securityRoutes from './routes/security.routes';
import analyticsRoutes from './routes/analytics.routes';
import agentRoutes from './routes/agent.routes';
import ssoRoutes from './routes/sso.routes';
import scimRoutes from './routes/scim.routes';
import { globalLimiter } from './middlewares/rateLimiter';
import { initVideoWorker } from './queues/video.queue';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

dotenv.config();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const app = express();
const PORT = process.env.PORT || 5005;
const server = createServer(app);

// Setup Socket.IO
const io = setupSocketIO(server);

// Init Background Workers
initVideoWorker();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
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
app.use('/api/v1/recordings', videoRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/video', createVideoRoutes(io));
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/security', securityRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/sso', ssoRoutes);
app.use('/scim/v2', scimRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nexus API is running securely' });
});

// Global Error Handler
Sentry.setupExpressErrorHandler(app);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error Handler]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

server.listen(PORT, () => {
  console.log(`Server is running securely on port ${PORT}`);
});
