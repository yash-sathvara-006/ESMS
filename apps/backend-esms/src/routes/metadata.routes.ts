import { Router } from 'express';
import { metadataController } from '../controllers/metadata.controller';

const router = Router();

router.get('/departments', (req, res, next) => metadataController.getDepartments(req, res, next));
router.get('/countries', (req, res, next) => metadataController.getCountries(req, res, next));

export default router;
