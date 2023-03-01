import { Router } from 'express';
import { addUserContactHandler, getUserContactsHandler, searchUserContactsHandler } from '../controllers/currentuser.controllers';
import { getServiceDataSchema } from '../controllers/data.controllers';
import {
  messageExists,
  roomExists,
  userCanSendMessage,
  userSentMessage
} from '../middleware/userCanChat';

const router = Router();

router.get('/', getServiceDataSchema);
router.get('/settings'); // Get chat settings
router.patch('/settings'); // Update chat settings
router.get('/contacts', getUserContactsHandler); // Get user contacts
router.post('/contacts', addUserContactHandler);
router.get('/contacts/search', searchUserContactsHandler);
router.get('/contacts/:roomId/messages', userCanSendMessage); // Get room messages
router.post('/contacts/:roomId/messages', userCanSendMessage); // Send message to room;
router.delete('/contacts/:roomId/message/:messageId', userSentMessage); // Get message reactions;
router.get('/contacts/:roomId/message/:messageId/react', userCanSendMessage, messageExists); // Get message reactions;
router.post('/contacts/:roomId/message/:messageId/react', userCanSendMessage); // React to message
router.delete('/contacts/:roomId/message/:messageId/react', userCanSendMessage, messageExists); // delete reaction to message
router.get('/contacts/:roomId/participants', roomExists); // Get room details and participants

router.get('/invites/sent'); // Get sent invites
router.get('/invites/received'); // Get received invites
router.delete('/accept/invites'); // reject all invites
router.get('/accept/invites'); // Bulk accept invites
router.get('/accept/invites/:inviteId'); // accept invite
router.delete('/accept/invites'); // Bulk decline invites
router.delete('/accept/invites/:inviteId'); // reject invite

export { router as currentUserRoutes };
