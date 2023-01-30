import { isValidDate } from '@cribplug/common';
import {
  object, string
} from 'zod';
import { db } from '../lib/lokijs';

function resourceExists(collectionName: string, key: string, value: string) {
  const collection = db.getCollection(collectionName);
  const result = collection.findOne({ [key]: value });
  console.log({ result });
  return Boolean(result);
}

function subgroupBelongsToPurpose(subgroup: string, purpose: string) {
  const sg = db.getCollection('subgroups').findOne({ purposeSubgroup: subgroup });
  console.log({ sg });
  return sg ? sg.listingPurpose === purpose : false;
}

export const listingTypeFieldsRequired = {
  listingType: string({
    required_error: ''
  }).min(1, '')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Listing Type must be in all caps and underscore separated, e.g. LISTING_TYPE')
    .refine((data) => resourceExists('listingTypes', 'listingType', data), 'Invalid listing type key'),
  listingPurpose: string({
    required_error: ''
  }).min(1, '')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Listing purpose must be in all caps and underscore separated, e.g. LISTING_PURPOSE')
    .refine((val) => resourceExists('purposes', 'listingPurpose', val), 'Listing purpose does not exist'),
  listingPurposeSubgroup: string({
    required_error: ''
  }).min(1, '')
    .refine((val) => /^[A-Z_]+$/.test(val), 'purpose subgroup must be in all caps and underscore separated, e.g. PURPOSE_SUBGROUP')
    .refine((val) => resourceExists('subgroups', 'purposeSubgroup', val), 'Purpose Subgroup does not exist')
};

export const listingTypeFieldsOptional = {
  listingType: string({}).min(1, '')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Listing Type must be in all caps and underscore separated, e.g. LISTING_TYPE')
    .refine((data) => resourceExists('listingTypes', 'listingType', data), 'Invalid listing type key')
    .optional(),
  listingPurpose: string({}).min(1, '')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Listing purpose must be in all caps and underscore separated, e.g. LISTING_PURPOSE')
    .refine((val) => resourceExists('purposes', 'listingPurpose', val), 'Listing purpose does not exist')
    .optional(),
  listingPurposeSubgroup: string({}).min(1, '')
    .refine((val) => /^[A-Z_]+$/.test(val), 'purpose subgroup must be in all caps and underscore separated, e.g. PURPOSE_SUBGROUP')
    .refine((val) => resourceExists('subgroups', 'purposeSubgroup', val), 'Purpose Subgroup does not exist')
    .optional(),
};

const listingParam = {
  params: object({
    listingId: string({
      required_error: 'Listing Id is required'
    }).min(1, 'Listing Id must be at least 1 character long')
  })
};

export const createListingSchema = object({
  body: object({
    title: string({
      required_error: 'title is required',
    }).min(1, 'title must be at least 1 character long'),
    caption: string({
      required_error: 'caption is required',
    }).min(1, 'shortDescription must be at least 1 character long').max(160, 'caption must be at most 160 characters long'),
    longDescription: string({}).min(1, 'longDescription must be at least 1 character long').optional(),
    ...listingTypeFieldsOptional
  }).refine((data) => (data.listingPurpose || data.listingPurposeSubgroup ? subgroupBelongsToPurpose(data.listingPurposeSubgroup as string, data.listingPurpose as string) : false), 'Invalid listing purpose or subgroup')
});

export const setListingTypeSchema = object({
  ...listingParam,
  body: object({
    ...listingTypeFieldsRequired
  }).refine((data) => subgroupBelongsToPurpose(data.listingPurposeSubgroup, data.listingPurpose), 'Invalid Listing purpose subgroup')
});

export const createListingFields = ['title', 'caption', 'longDescription', 'listingType', 'listingPurpose', 'listingPurposeSubgroup'];
export const listingTypeFieldsList = ['listingType', 'listingPurpose', 'listingPurposeSubgroup'];

const htmlRegex = /<\/?[^>]+(>|$)/gi;
export const stripHTML = (html: string) => html.replace(htmlRegex, '');

export const isBoolean = (val: any) => Boolean(val) === val;

export const sanitizeData = (fields: string[], data: any) => {
  const sanitizedData: { [key: string]: any } = {};
  fields.forEach((field) => {
    if (isBoolean(data[field])) {
      sanitizedData[field] = data[field];
      return;
    }
    if (data[field]) {
      sanitizedData[field] = data[field];
      if (isValidDate(data[field])) {
        sanitizedData[field] = new Date(data[field]);
      }
    }
  });
  return sanitizedData;
};
