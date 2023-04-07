import { Router } from 'express';
import {
  acceptFollowRequestHandler,
  blockUserHandler,
  bulkAcceptFollowRequestsHandler,
  bulkCancelFollowRequestsHandler,
  cancelSentFollowRequestHandler,
  declineFollowRequestHandler,
  followUserHandler,
  getUserBlockedUsersHandler,
  getUserFollowersHandler,
  getUserFollowingHandler,
  getUserFollowingUserStatusHandler,
  getUserFollowRequestsHandler,
  getUserSentFollowRequestsHandler,
  removeUserFollowingUserHandler,
  searchUserFollowersHandler,
  searchUserFollowingHandler,
  unblockUserHandler,
  unfollowUserHandler,
  getUserReceivedFollowRequestsHandler,
  searchUserSentFollowRequestsHandler,
  searchUserReceivedFollowRequestsHandler,
  getTaggableProfilesHandler,
} from '../controllers/currentuser.controllers';
import { getCurrentUserProfile, updateProfileImage, updateProfileWallpaper } from '../controllers/profile.controllers';
import { canFollow, profileIsNotSelf } from '../middleware/followFilters';
import { uploadImage } from '../middleware/multerUpload';
// import { getCurrentUserProfile, updateProfile } from '../controllers/profile.controllers';

const router = Router();

router.get('/profile', getCurrentUserProfile);
router.post('/image', uploadImage.single('profileImage'), updateProfileImage);
router.post('/wallpaper', uploadImage.single('profileWallpaper'), updateProfileWallpaper);
router.get('/taggable', getTaggableProfilesHandler);
router.get('/followers', getUserFollowersHandler); // Get my followers
router.get('/followers/search', searchUserFollowersHandler); // Search my followers
router.get('/following', getUserFollowingHandler); // Get people i'm following
router.get('/following/search', searchUserFollowingHandler); // Search people i'm following
router.get('/follow-requests', getUserFollowRequestsHandler); // Get follow requests (sent & recieved);
router.get('/follow-requests/sent', getUserSentFollowRequestsHandler);
router.get('/follow-requests/sent/search', searchUserSentFollowRequestsHandler);
router.get('/follow-requests/received', getUserReceivedFollowRequestsHandler);
router.get('/follow-requests/received/search', searchUserReceivedFollowRequestsHandler);
router.post('/follow-requests', bulkAcceptFollowRequestsHandler); // Bulk accept recieved follow requests;
router.delete('/follow-requests', bulkCancelFollowRequestsHandler); // Bulk cancel follow requests;
router.post('/follow-requests/:username', profileIsNotSelf, acceptFollowRequestHandler); // Accept follow request;
router.delete('/follow-request/:username', profileIsNotSelf, declineFollowRequestHandler); // Cancel / delete follow request;
router.delete('/follow-request/sent/:username', profileIsNotSelf, cancelSentFollowRequestHandler); // Cancel Sent follow request
router.get('/blocked', getUserBlockedUsersHandler); // Get people I've blocked
router.post('/block/:username', profileIsNotSelf, blockUserHandler); // Block user
router.delete('/block/:username', profileIsNotSelf, unblockUserHandler); // Remove user from blocked list
router.get('/follow/:username', canFollow, getUserFollowingUserStatusHandler); // Get following status
router.post('/follow/:username', canFollow, followUserHandler); // Follow (or create follow request if private)
router.delete('/follow/:username', profileIsNotSelf, removeUserFollowingUserHandler); // Remove following
router.post('/unfollow/:username', profileIsNotSelf, unfollowUserHandler); // Unfollow user

export { router as currentUserRoutes };
