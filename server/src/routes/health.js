import { Router } from 'express';
import { config } from '../config/index.js';

export const healthRouter = Router();

/** For uptime monitors, load balancers and container health checks. */
healthRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
