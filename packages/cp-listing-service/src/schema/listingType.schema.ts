import { mdiIconsList } from '@cribplug/common';
import {
  boolean, object, string
} from 'zod';
import { db } from '../lib/lokijs';

function resourceExists(collectionName: string, key: string, value: string) {
  const collection = db.getCollection(collectionName);
  const result = collection.findOne({ [key]: value });
  console.log({ result });
  return Boolean(result);
}

const commonRequiredFields = {
  title: string({
    required_error: 'title is required',
  }).min(1, 'title must be at least 1 character long'),
  descriptionHTML: string({
    required_error: 'description is required',
  }).min(1, 'description must be at least 1 character long'),
  isActive: boolean({
    invalid_type_error: 'active status must be a boolean',
  }).optional(),
  mdiIcon: string({
    required_error: 'mdi icon is required',
  }).min(1, 'mdi icon must be at least 1 character long')
    .refine((data) => mdiIconsList.includes(data), 'Invalid mdi Icon'),
  faIcon: string({
    required_error: 'font awesome icon is required',
  }).min(1, 'font awesome icon must be at least 1 character long')
    .refine((data) => resourceExists('faIcons', 'name', data), 'Invalid font awesome Icon'),
};

const commonOptionalFields = {
  body: object({
    title: string().min(1, 'title must be at least 1 character long').optional(),
    descriptionHTML: string().min(1, 'description must be at least 1 character long').optional(),
    isActive: boolean({
      invalid_type_error: 'isActive status must be a boolean',
    }).optional(),
    mdiIcon: string().min(1, 'mdi Icon must be at least 1 character long').optional()
      .refine((data) => (data === undefined ? true : mdiIconsList.includes(data)), 'Invalid mdi icon'),
    faIcon: string().min(1, 'font awesome Icon must be at least 1 character long').optional()
      .refine((data) => (data === undefined ? true : resourceExists('faIcons', 'name', data)), 'Invalid font awesome icon'),
  })
};

const typeParam = {
  params: object({
    typeId: string({
      required_error: 'Listing type key is required',
    }).min(1, 'Listing type key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'Listing Type must be in all caps and underscore separated, e.g. LISTING_TYPE')
      .refine((data) => resourceExists('listingTypes', 'listingType', data), 'Invalid listing type key'),
  })
};

const newkeyQuery = {
  query: object({
    newkey: string().min(1, 'Listing Type must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'Listing Type must be in all caps and underscore separated, e.g. LISTING_TYPE')
      .refine((val) => !resourceExists('listingTypes', 'listingType', val), 'Listing Type already exists')
      .optional(),
  }).optional(),
};

export const createListingTypeSchema = object({
  body: object({
    listingType: string({
      required_error: 'Listing Type Key is required',
    }).min(1, 'Listing Type must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'Listing Type must be in all caps and underscore separated, e.g. LISTING_TYPE')
      .refine((val) => !resourceExists('listingTypes', 'listingType', val), 'Listing Type already exists'),
    ...commonRequiredFields,
  })
});

export const updateListingTypeSchema = object({
  ...typeParam,
  ...newkeyQuery,
  ...commonOptionalFields,
});

export const deleteListingTypeSchema = object({
  ...typeParam,
});

export const listingTypeCreateFields = ['listingType', 'title', 'descriptionHTML', 'isActive', 'faIcon', 'mdiIcon'];
export const listingTypeUpdateFields = ['title', 'descriptionHTML', 'isActive', 'faIcon', 'mdiIcon'];
