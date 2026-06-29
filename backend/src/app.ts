import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { signResponse } from './middleware/signResponse';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import catalogRoutes from './routes/catalogRoutes';
import licenseRoutes from './routes/licenseRoutes';
import clientApiRoutes from './routes/clientApiRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: 'Trop de requêtes' },
});
app.use(globalRateLimit);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(signResponse);

// Admin API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/stats', statsRoutes);

// Client API (Electron apps)
app.use('/api/v1/client', clientApiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
