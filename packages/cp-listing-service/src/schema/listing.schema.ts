import { isValidDate } from '@cribplug/common';
import {
  array,
  object, string
} from 'zod';
import { db } from '../lib/lokijs';

function resourceExists(collectionName: string, key: string, value: string) {
  const collection = db.getCollection(collectionName);
  const result = collection.findOne({ [key]: value });
  console.log({ result });
  return Boolean(result);
}

function hasDuplicates(elements: { [key: string]: any }[], field: string): boolean {
  const names = elements.map((e) => e[field]);
  return names.length !== new Set(names).size;
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

export const listingAmenityFieldsRequired = {
  amenity: string({
    required_error: 'Amenity Key is required',
  }).min(1, '')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Amenity Key must be in all caps and underscore separated, e.g. AMENITY_KEY')
    .refine((data) => resourceExists('amenities', 'amenity', data), 'Invalid Amenity key'),
  description: string({})
    .max(160, 'Description cannot be more than 160 characters long')
    .optional()
};

const listingParam = {
  params: object({
    listingId: string({
      required_error: 'Listing Id is required'
    }).min(1, 'Listing Id must be at least 1 character long')
  })
};

const listingAmenityParams = {
  listingId: string({
    required_error: 'Listing Id is required'
  }).min(1, 'Listing Id must be at least 1 character long'),
  amenity: string({
    required_error: 'Amenity Key is required',
  }).min(1, '')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Amenity Key must be in all caps and underscore separated, e.g. AMENITY_KEY')
    .refine((data) => resourceExists('amenities', 'amenity', data), 'Invalid Amenity key'),
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

export const addAmenityToListingSchema = object({
  body: object({
    ...listingAmenityFieldsRequired
  })
});

export const mutateListingAmenitySchema = object({
  params: object({
    ...listingAmenityParams,
  }),
});

export const setListingTypeSchema = object({
  ...listingParam,
  body: object({
    ...listingTypeFieldsRequired
  }).refine((data) => subgroupBelongsToPurpose(data.listingPurposeSubgroup, data.listingPurpose), 'Invalid Listing purpose subgroup')
});

export const addMultipleListingAmenitiesSchema = object({
  ...listingParam,
  body: object({
    amenities: array(object({
      amenity: string({
        required_error: 'Amenity Key is required',
      }).min(1, '')
        .refine((val) => /^[A-Z_]+$/.test(val), 'Amenity Key must be in all caps and underscore separated, e.g. AMENITY_KEY')
        .refine((data) => resourceExists('amenities', 'amenity', data), 'Invalid Amenity key'),
      description: string({})
        .max(160, 'Description cannot be more than 160 characters long')
        .optional()
    })).nonempty({
      message: 'Please select at least one amenity'
    }).refine((data) => !hasDuplicates(data, 'amenity'), 'Cannot select an amenity multiple times')
  })
});

export const createListingFields = ['title', 'caption', 'longDescription', 'listingType', 'listingPurpose', 'listingPurposeSubgroup'];
export const listingTypeFieldsList = ['listingType', 'listingPurpose', 'listingPurposeSubgroup'];
export const listingAmenityFieldsList = ['amenity', 'description'];
export const updateListingAmenityFields = ['description'];

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
