import { Router } from 'express';
import { notYetImplementedHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/listings', notYetImplementedHandler); // Get published user listings
router.get('/listings/all', notYetImplementedHandler); // Get all listings created by user
router.get('/listings/saved', notYetImplementedHandler); // Get saved / favorited listings

export { router as userRoutes };
