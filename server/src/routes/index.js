import { Router } from 'express';
import { healthRouter } from './health.js';
import { reservationsRouter } from './reservations.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(reservationsRouter);

export default apiRouter;
