import { Router } from 'express';
import metadataRoutes from './metadata.routes';
import employeeRoutes from './employee.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/metadata', metadataRoutes);
router.use('/employees', employeeRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
