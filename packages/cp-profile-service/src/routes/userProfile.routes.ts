import { Router } from 'express';
import {
  getProfileByUserId,
  getProfileByUsername,
  getProfileImagehandler,
  getProfileWallpaperhandler,
  getSuggestedProfilesHandler,
  searchProfilesHandler
} from '../controllers/profile.controllers';
import {
  getUserFollowershandler,
  getUserFollowingHandler,
  searchUserFollowersHandler,
  searchUserFollowingHandler
} from '../controllers/userProfile.controllers';
import { } from '../middleware/followFilters';

const router = Router();

router.get('/id/profile/:userId', getProfileByUserId);
router.get('/profile/:username', getProfileByUsername);
router.get('/image/:username', getProfileImagehandler);
router.get('/wallpaper/:username', getProfileWallpaperhandler);
router.get('/suggested', getSuggestedProfilesHandler);
router.get('/profiles/search', searchProfilesHandler);
router.get('/profile/:username/followers', getUserFollowershandler); // get user followers
router.get('/profile/:username/followers/search', searchUserFollowersHandler); // search user followers
router.get('/profile/:username/following/', getUserFollowingHandler); // get user following
router.get('/profile/:username/following/search', searchUserFollowingHandler);

export { router as userProfileRoutes };
