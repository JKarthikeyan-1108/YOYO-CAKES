import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import deliveryRouter from './routes/delivery';
import ordersRouter from './routes/orders';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting local dev and Vercel production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://yoyocakes-seven.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin === 'https://yoyocakes-seven.vercel.app' ||
        origin.endsWith('.vercel.app') ||
        origin.includes('yoyocakes')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/staging
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint for Render / Uptime monitors
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'yoyo-cakes-backend',
    platform: 'Render',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/delivery', deliveryRouter);
app.use('/api/orders', ordersRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'NotFound', message: 'API endpoint not found.' });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred.',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🍰 YOYO CAKES Express Backend running on port ${PORT}`);
    console.log(`📍 Delivery Serviceability & Orders API ready at http://localhost:${PORT}/api/delivery/check-serviceability`);
  });
}

export default app;
