import { isValidDate } from '@cribplug/common';
import { object, string } from 'zod';

export const listingTypeSchema = object({
  body: object({
    listingType: string({
      required_error: 'Listing type (key) is required',
    }).min(1, 'Listing type must be at least 1 character long').refine((val) => /^[A-Z_]+$/.test(val), 'Listing type must be in all caps and underscore separated, e.g. LISTING_TYPE'),
    title: string({
      required_error: 'Listing type title is required',
    }).min(1, 'Listing type title must be at least 1 character long'),
    description: string({
      required_error: 'Listing type description is required',
    }).min(1, 'Listing type description must be at least 1 character long'),
  })
});

export const listingPurposeSchema = object({
  body: object({
    listingPurpose: string({
      required_error: 'Listing purpose (key) is required',
    }).min(1, 'Listing purpose must be at least 1 character long').refine((val) => /^[A-Z_]+$/.test(val), 'Listing purpose must be in all caps and underscore separated, e.g. LISTING_PURPOSE'),
    title: string({
      required_error: 'Listing purpose title is required',
    }).min(1, 'Listing purpose title must be at least 1 character long'),
    description: string({
      required_error: 'Listing purpose description is required',
    }).min(1, 'Listing purpose description must be at least 1 character long'),
  })
});

export const listingTypeCreateFields = ['listingType', 'title', 'description', 'isActive', 'icon'];
export const listingPurposeCreateFields = ['listingPurpose', 'title', 'description', 'isActive', 'icon'];
export const listingTypeUpdateFields = ['title', 'description', 'isActive', 'icon'];
export const purposeSubgroupCreateFields = ['purposeSubgroup', 'title', 'description', 'isActive', 'icon'];

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
