import { Request, Response } from 'express';
import { db } from '../../lib/lokijs';
import { createHouseRuleFields, updateHouseRuleFields } from '../../schema/houseRule.schema';
import { sanitizeData, stripHTML } from '../../schema/listing.schema';
import { deleteCache, setCache } from '../../services/cache.service';
import HouseRulesDBService from '../../services/houseRules.service';
import { config } from '../../utils/config';

const { basePath } = config.self;

const houseRulesService = new HouseRulesDBService();

export const getHouseRulesHandler = async (req: Request, res: Response) => {
  const houseRules = await houseRulesService.getHouseRules();
  await setCache(req.redis, req.originalUrl, houseRules);
  res.status(houseRules.statusCode).json(houseRules);
};

export const createHouseRuleHandler = async (req: Request, res: Response) => {
  const houseRuleData = sanitizeData(createHouseRuleFields, req.body);
  if (houseRuleData.descriptionHTML) {
    houseRuleData.descriptionText = stripHTML(houseRuleData.descriptionHTML);
  }
  const houseRule = await houseRulesService.createHouseRule(houseRuleData);
  if (houseRule.success) {
    db.getCollection('houseRules').insert(houseRule.data);
    db.saveDatabase();
  }
  res.status(houseRule.statusCode).json(houseRule);
};

export const updateHouseRuleHandler = async (req: Request, res: Response) => {
  const { houseRule } = req.params;
  const { newkey } = req.query;
  const houseRuleData = sanitizeData(updateHouseRuleFields, req.body);
  if (houseRuleData.descriptionHTML) {
    houseRuleData.descriptionText = stripHTML(houseRuleData.descriptionHTML);
  }
  if (newkey) {
    houseRuleData.houseRule = newkey;
  }
  const hrsr = await houseRulesService.updateHouseRule(houseRule, houseRuleData);
  if (hrsr.success) {
    const houseRules = db.getCollection('houseRules');
    let hr = houseRules.findOne({ houseRule });
    hr = { ...hr, ...hrsr.data };
    houseRules.update(hr);
    db.saveDatabase();
    deleteCache(req.redis, [`${basePath}/settings/house-rules`, `${basePath}/settings/house-rules/${houseRule}`]);
  }
  res.status(hrsr.statusCode).json(hrsr);
};

export const deleteHouseRuleHandler = async (req: Request, res: Response) => {
  const { houseRule } = req.params;
  const deletedHouseRule = await houseRulesService.deleteHouseRule(houseRule);
  if (deletedHouseRule.success) {
    const houseRules = db.getCollection('houseRules');
    houseRules.removeWhere({ houseRule });
    db.saveDatabase();
    deleteCache(req.redis, [`${basePath}/settings/house-rules`, `${basePath}/settings/house-rules/${houseRule}`]);
  }
  res.status(deletedHouseRule.statusCode).json(deletedHouseRule);
};
