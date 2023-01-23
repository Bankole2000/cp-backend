import { Router } from 'express';
import {
  createHouseRuleHandler,
  deleteHouseRuleHandler,
  getHouseRulesHandler,
  updateHouseRuleHandler
} from '../../controllers/settings/houseRules.controllers';
import { clearFromCache, getFromCache } from '../../middleware/cacheRequests';
import { requireLoggedInUser, requireRole } from '../../middleware/requireUser';
import { validate } from '../../middleware/validateRequests';
import { createHouseRuleSchema, deleteHouseRuleSchema, updateHouseRuleSchema } from '../../schema/houseRule.schema';

const router = Router();

router.get('/', getFromCache, getHouseRulesHandler);
router.post('/', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(createHouseRuleSchema, 'Create House Rule'), clearFromCache, createHouseRuleHandler);
router.patch('/:houseRule', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(updateHouseRuleSchema, 'Update House Rule'), updateHouseRuleHandler);
router.delete('/:houseRule', requireLoggedInUser, requireRole(['ADMIN', 'SYSTEM']), validate(deleteHouseRuleSchema, 'Delete House Rule'), deleteHouseRuleHandler);

export { router as houseRulesRoutes };
