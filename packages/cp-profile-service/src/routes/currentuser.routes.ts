import { Router } from 'express';
import { getCurrentUserProfile, updateProfileImage, updateProfileWallpaper } from '../controllers/profile.controllers';
import { uploadImage } from '../middleware/multerUpload';
import { requireLoggedInUser } from '../middleware/requireUser';
// import { getCurrentUserProfile, updateProfile } from '../controllers/profile.controllers';

const router = Router();

router.get('/profile', getCurrentUserProfile);
router.post('/image', requireLoggedInUser, uploadImage.single('profileImage'), updateProfileImage);
router.post('/wallpaper', requireLoggedInUser, uploadImage.single('profileWallpaper'), updateProfileWallpaper);
// router.post('/profile', updateProfile);

export { router as currentUserRoutes };
