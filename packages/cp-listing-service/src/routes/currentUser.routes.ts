import { Router } from 'express';
import { getCurrentUserAllListings, getCurrentUserPublishedListings } from '../controllers/currentuser.controllers';
import { notYetImplementedHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/listings', getCurrentUserPublishedListings); // Get published user listings
router.get('/listings/all', getCurrentUserAllListings); // Get all listings created by user published and unpublished
router.get('/listings/saved', notYetImplementedHandler); // Get saved / favorited listings

export { router as currentUserRoutes };
