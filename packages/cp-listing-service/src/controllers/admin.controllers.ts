import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import { isBoolean } from '../schema/listing.schema';
import AdminDBService from '../services/admin.service';
import UserDBService from '../services/user.service';

const adminService = new AdminDBService();
const userService = new UserDBService();

export const getAllListingsHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 20;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await adminService.getAllListings(page, limit);
  return res.status(sr.statusCode).send(sr);
};

export const getUserListingsHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 20;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const userExists = await userService.findUserByUsername(username);
  if (!userExists.success) {
    return res.status(userExists.statusCode).send(userExists);
  }
  const sr = await adminService.getUserListings(userExists.data.userId);
  return res.status(sr.statusCode).send(sr);
};

export const searchAllListingsHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  const where: { [key: string]: any } = {};
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 20;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  if (req.query.purpose) {
    where.listingPurpose = req.query.purpose;
  }
  if (req.query.type) {
    where.listingType = req.query.type;
  }
  if (req.query.subgroup) {
    where.listingPurposeSubgroup = req.query.subgroup;
  }
  console.log({ isPublished: req.query.isPublished });
  if (req.query.isPublished) {
    where.isPublished = req.query.isPublished !== 'false';
  }
  if (req.query.q) {
    const title = {
      contains: req.query.q,
      mode: 'insensitive'
    };
    const caption = {
      contains: req.query.q,
      mode: 'insensitive'
    };
    const longDescription = {
      contains: req.query.q,
      mode: 'insensitive'
    };
    where.OR = [
      { title }, { caption }, { longDescription }
    ];
  }
  if (req.query.amenities) {
    const amenities = req.query.amenities.toString().split(',');
    where.amenities = {
      some: {
        amenity: {
          in: amenities
        }
      }
    };
  }
  if (req.query.houseRules) {
    const houseRules = req.query.houseRules.toString().split(',');
    where.houseRules = {
      every: {
        houseRule: {
          in: houseRules
        }
      },
      none: {
        isAllowed: false,
      }
    };
  }
  let sr: ServiceResponse;
  if (Object.keys(where).length) {
    sr = await adminService.searchListings(where, page, limit);
    return res.status(sr.statusCode).send(sr);
  }
  sr = await adminService.getAllListings(page, limit);
  return res.status(sr.statusCode).send(sr);
};
