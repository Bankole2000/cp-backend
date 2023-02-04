import { Request, Response } from 'express';
import { listingHouseRuleFieldsList, sanitizeData } from '../../schema/listing.schema';
import HouseRulesDBService from '../../services/houseRules.service';
import ListingDBService from '../../services/listing.service';

const hrService = new HouseRulesDBService();
const listingService = new ListingDBService();

export const getListingHouseRulesHandler = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const lExists = await listingService.getListingById(listingId);
  if (!lExists.success) {
    return res.status(lExists.statusCode).send(lExists);
  }
  const houseRules = await hrService.getListingHouseRules(listingId);
  return res.status(houseRules.statusCode).send(houseRules);
};

export const addListingHouseRuleHandler = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  console.log({ listingId });
  const hrData = sanitizeData(listingHouseRuleFieldsList, req.body);
  const lhhrSR = await hrService.listingHasHouseRule(listingId, hrData.houseRule);
  if (lhhrSR.success) {
    const newHR = await hrService
      .updateListingHouseRule(listingId, hrData.houseRule, hrData);
    return res.status(newHR.statusCode).send(newHR);
  }
  const sr = await hrService.addHouseRuleToListing(listingId, hrData);
  return res.status(sr.statusCode).send(sr);
};

export const addMultipleListingHouseRulesHandler = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  await hrService.removeAllListingHouseRules(listingId);
  const sr = await hrService.setMultipleListingHouseRules(listingId, req.body.houseRules);
  return res.status(sr.statusCode).send(sr);
};

export const updateListingHouseRuleHandler = async (req: Request, res: Response) => {
  const { listingId, houseRule } = req.params;
  const { description, isAllowed } = req.body;
  const houseRuleData = {
    description,
    isAllowed: !!isAllowed
  };
  const lhhrSR = await hrService.listingHasHouseRule(listingId, houseRule);
  if (lhhrSR.success) {
    const newhr = await hrService
      .updateListingHouseRule(listingId, houseRule, houseRuleData);
    return res.status(newhr.statusCode).send(newhr);
  }
  return res.status(lhhrSR.statusCode).send(lhhrSR);
};

export const removeListingHouseRuleHandler = async (req: Request, res: Response) => {
  const { listingId, houseRule } = req.params;
  const lhhrSR = await hrService.listingHasHouseRule(listingId, houseRule);
  if (lhhrSR.success) {
    const newhr = await hrService
      .removeListingHouseRule(listingId, houseRule);
    return res.status(newhr.statusCode).send(newhr);
  }
  return res.status(lhhrSR.statusCode).send(lhhrSR);
};

export const removeAllListingHouseRulesHandler = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const sr = await hrService.removeAllListingHouseRules(listingId);
  return res.status(sr.statusCode).send(sr);
};
