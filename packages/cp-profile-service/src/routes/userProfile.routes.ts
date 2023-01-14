import { Router } from 'express';
import {
  getProfileByUserId, getProfileByUsername, getProfileImagehandler, getProfileWallpaperhandler
} from '../controllers/profile.controllers';

const router = Router();

router.get('/id/:userId/profile', getProfileByUserId);
router.get('/:username/profile', getProfileByUsername);
router.get('/image/:username', getProfileImagehandler);
router.get('/wallpaper/:username', getProfileWallpaperhandler);

export { router as userProfileRoutes };
